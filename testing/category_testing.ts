import { getQuipsterV3, getV3 , insertV3 } from "../controller/master/category";
import { Request, Response } from "express";
import { globalHandler } from '../function/global';
import { startTransaction } from '../util/mysql';
import { User } from '../type/user'

describe("getV3", () => {
  let req: any;
  let res: Response;

  beforeEach(() => {
    req = {
      body: {
        user: {
          business_code: 2,
        },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  });

  it("should return success response with category data", async () => {
    // Arrange
    const expectedResponse = {
      success: true,
      message: "5 data/s found.",
      info: {
        categories: 5,
      },
      data: [
        {
          code: 43,
          name: "Coba Retrofit123",
          count: "26",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 31,
          name: "Hai",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 39,
          name: "KATEGORI 1",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 40,
          name: "KATEGORI 2",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 4,
          name: "Umum",
          count: "11",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
      ],
    };

    // Act
    await getV3(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should return success response with category data when business code is 9", async () => {
    // Arrange
    req.body.user.business_code = 9;
    const expectedResponse = {
      success: true,
      message: "19 data/s found.",
      info: {
        categories: 19,
      },
      data: [
        {
          code: 66,
          name: "Akselindo",
          count: "52",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 19,
          name: "Cat Puffin",
          count: "71",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 20,
          name: "DCK Armature",
          count: "55",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 28,
          name: "DCK Carbon Brush",
          count: "25",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 21,
          name: "DCK Power Tool",
          count: "78",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 22,
          name: "DCK Stator",
          count: "49",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 23,
          name: "DCK Tool",
          count: "45",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 29,
          name: "Deluxe",
          count: "174",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 27,
          name: "Diton",
          count: "16",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 47,
          name: "Fata",
          count: "48",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 24,
          name: "Keran Awet",
          count: "21",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 26,
          name: "Others",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 64,
          name: "Paint Pro",
          count: "4",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 65,
          name: "Pipa Ceylon",
          count: "16",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 69,
          name: "Pipa Champion",
          count: "5",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 68,
          name: "Pipa Pacific Putih",
          count: "21",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 67,
          name: "Pipa Super Intilon",
          count: "25",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 25,
          name: "Pipa Westpex",
          count: "33",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
        {
          code: 30,
          name: "Vinilon Nusantara",
          count: "397",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
        },
      ],
    };

    // Act
    await getV3(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });
});

describe("getQuipsterV3", () => {
  let req: any;
  let res: Response;

  beforeEach(() => {
    req = {
      body: {
        user: {
          business_code: 2,
        },
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;
  });

  it("should return success response with category data", async () => {
    // Arrange
    const expectedResponse = {
      success: true,
      message: "5 data/s found.",
      info: {
        categories: 5,
      },
      data: [
        {
          code: 43,
          name: "Coba Retrofit123",
          count: "26",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: null,
          supplier_name: null,
        },
        {
          code: 31,
          name: "Hai",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 10,
          supplier_name: "Teguh",
        },
        {
          code: 39,
          name: "KATEGORI 1",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 9,
          supplier_name: "Ikbar",
        },
        {
          code: 40,
          name: "KATEGORI 2",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 10,
          supplier_name: "Teguh",
        },
        {
          code: 4,
          name: "Umum",
          count: "11",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 1,
          supplier_name: "Adit",
        },
      ],
    };

    // Act
    await getQuipsterV3(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should return success response with category data when business code is 9", async () => {
    // Arrange
    req.body.user.business_code = 9;
    const expectedResponse = {
      success: true,
      message: "19 data/s found.",
      info: {
        categories: 19,
      },
      data: [
        {
          code: 66,
          name: "Akselindo",
          count: "52",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 16,
          supplier_name: "Akselindo Jaya",
        },
        {
          code: 19,
          name: "Cat Puffin",
          count: "71",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 7,
          supplier_name: "PT Indowijaya Sakti Teguh",
        },
        {
          code: 20,
          name: "DCK Armature",
          count: "55",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 6,
          supplier_name: "DCK (PT. Multi Perkasa Global)",
        },
        {
          code: 28,
          name: "DCK Carbon Brush",
          count: "25",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 6,
          supplier_name: "DCK (PT. Multi Perkasa Global)",
        },
        {
          code: 21,
          name: "DCK Power Tool",
          count: "78",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 6,
          supplier_name: "DCK (PT. Multi Perkasa Global)",
        },
        {
          code: 22,
          name: "DCK Stator",
          count: "49",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 6,
          supplier_name: "DCK (PT. Multi Perkasa Global)",
        },
        {
          code: 23,
          name: "DCK Tool",
          count: "45",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 6,
          supplier_name: "DCK (PT. Multi Perkasa Global)",
        },
        {
          code: 29,
          name: "Deluxe",
          count: "174",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 13,
          supplier_name: "Deluxe (PT. Global Pasifik Prima)",
        },
        {
          code: 27,
          name: "Diton",
          count: "16",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 47,
          name: "Fata",
          count: "48",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 14,
          supplier_name: "PT Fata Mulia Sejahtera",
        },
        {
          code: 24,
          name: "Keran Awet",
          count: "21",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 26,
          name: "Others",
          count: "0",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: null,
          supplier_name: null,
        },
        {
          code: 64,
          name: "Paint Pro",
          count: "4",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 12,
          supplier_name: "PT. Ritel Jaya Sakti",
        },
        {
          code: 65,
          name: "Pipa Ceylon",
          count: "16",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 69,
          name: "Pipa Champion",
          count: "5",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 68,
          name: "Pipa Pacific Putih",
          count: "21",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 67,
          name: "Pipa Super Intilon",
          count: "25",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 25,
          name: "Pipa Westpex",
          count: "33",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 11,
          supplier_name: "PT. Pasifik Plastindo Perkasa",
        },
        {
          code: 30,
          name: "Vinilon Nusantara",
          count: "397",
          pph: "0.00",
          use_tax: 1,
          use_service_charge: 1,
          supplier_code: 12,
          supplier_name: "PT. Ritel Jaya Sakti",
        },
      ],
    };

    // Act
    await getQuipsterV3(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });
});

