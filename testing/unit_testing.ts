import { Response } from 'express';
import { selectV3 } from '../controller/master/unit';

describe('selectV3', () => {
    let req: any;
    let res: Response;
  
    beforeEach(() => {
      req = {
        body: {
          user: {
            business_code: 9
          },
          name: ""
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
    });
  
    it('should return success response with unit data', async () => {
      // Arrange
      const expectedResponse = {
        "success": true,
        "message": "12 data/s found.",
        "data": [
            {
                "code": 19,
                "name": "Kaleng",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 95
            },
            {
                "code": 20,
                "name": "Kantong",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 4
            },
            {
                "code": 21,
                "name": "Lusin",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 4
            },
            {
                "code": 22,
                "name": "Pail",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 12
            },
            {
                "code": 23,
                "name": "Roll",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 5
            },
            {
                "code": 24,
                "name": "Unit",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 78
            },
            {
                "code": 25,
                "name": "Set",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 0
            },
            {
                "code": 26,
                "name": "Pasang",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 0
            },
            {
                "code": 50,
                "name": "Kg",
                "system": 4,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 0
            },
            {
                "code": 51,
                "name": "Bal",
                "system": 4,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 1
            },
            {
                "code": 49,
                "name": "Jerigen",
                "system": 8,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 1
            },
            {
                "code": 18,
                "name": "Pieces",
                "system": 99,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 935
            }
        ]
    };
      
      // Act
      await selectV3(req, res);
  
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  
    it('should return success response with category data when business code is 9', async () => {
      // Arrange
      req.body.user.business_code = 9;
      req.body.name = "Kaleng"
      const expectedResponse = {
        "success": true,
        "message": "1 data/s found.",
        "data": [
            {
                "code": 19,
                "name": "Kaleng",
                "system": 1,
                "smallest": 0,
                "smallest_name": "",
                "conversion": "1.00",
                "bigger_count": 0,
                "used_by_item": 95
            }
        ]
    };
    
      // Act
      await selectV3(req, res);
    
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  
  });