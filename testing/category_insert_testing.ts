import { getQuipsterV3, getV3 , insertV3 } from "../controller/master/category";
import { Request, Response } from "express";
import { globalHandler } from '../function/global';
import { startTransaction } from '../util/mysql';
import { User } from '../type/user'

type insertV3 = Omit<Request, 'body'> & {
    body: {
        user: User,
        name: string,
        business_code: number,
        user_code: number
    }
  };
  describe('insertV3', () => {
    let req: insertV3;
      let res: Response;
    
      beforeEach(() => {
          req = {
              body: {
                  name: '',
                  user: {
                      business_code: 0,
                      user_code: 0
                  },
                  business_code: 0,
                  user_code: 0
              }
          } as insertV3;
          res = {} as Response;
      });
    
      it('should insert a new category', async () => {
        req.body = {
          name: 'Test Category',
          business_code: 2,
          user_code: 2,
          user: {
            business_code: 2,
            user_code: 2
          }
        };
        const executeQuery = jest.fn().mockImplementation(async () => []);
        const result = {
          insertId: 1
        };
    
        await insertV3(req, res);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Kategori berhasil ditambahkan.',
          data: result.insertId,
          info: result
        });
        expect(executeQuery).toHaveBeenCalledWith(`
          SELECT
              i_code
          FROM
              dvw_master.vw_category
          WHERE
              fk_business = ${req.body.business_code}
              AND v_name = '${req.body.name}'
              AND b_isactive = 1
        `);
        expect(executeQuery).toHaveBeenCalledWith(`
          INSERT INTO 
              dvw_master.vw_category 
          SET 
              fk_user_modify = ${req.body.user.user_code},
              v_name = '${req.body.name}', 
              fk_business = ${req.body.user.business_code}
        `);
      });
    
      it('should throw an error if category already exists', async () => {
        req.body = {
          name: 'Test Category',
          business_code: 2,
          user_code: 2,
          user: {
            business_code: 2,
            user_code: 2
          }
        };
        const executeQuery = jest.fn().mockImplementation(async () => [{ i_code: 1 }]);
    
        await expect(insertV3(req, res)).rejects.toEqual({
          // httpResponse: {
          //   code: 500,
          //   success: false,
          //   message: 'Kategori telah ada.'
          // }
          httpResponse: {"code":500,"success":false,"message":"Kategori telah ada."}
        });
      });
    });