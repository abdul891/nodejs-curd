const { Validator } = require("node-input-validator");
const response = require("../config/response");
const helper = require("../helper/helper");
const users = require("../model/users");

const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
//------------------USER REGISTRAION------------------------
const signup = async (req, res) => {
  const requestData = req.body;
  requestData.profile_img = req.file?.filename;
  try {
    //Validate the request body data
    let validation = new Validator(requestData, {
      name: "required|alpha",
      email: "required|email",
      password: "required|string|minLength:8",
    });
    let matched = await validation.check();
    if (!matched) {
      return response.returnFalse(
        req,
        res,
        400,
        helper.validationErrorConvertor(validation),
        {}
      );
    }

    //Check if email is already exists or not
    const userData = await users.findOne({ email: requestData.email });
    if (userData) {
      return response.returnFalse(req, res, 401, 'This email address is already in use. Please try a different one or reset your password if needed', {});
    }

    requestData.password = await helper.encryptPassword( requestData.password);
    const userInfo = new users( requestData);
    const savedUser = await userInfo.save();
    if (savedUser) {
      return response.returnTrue(
        req,
        res,
        200,
        'Your registration has been completed successfully.',
        savedUser
      );
    } else {
      return response.returnFalse(req, res,401, 'Try again later', {});
    }
  } catch (error) {
   
    return response.returnFalse(req, res,500, 'Internal server error', {});
  }
};

//-------------------USER LOGIN-----------------------

const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    let validation = new Validator(req.body, {
      email: "required|email",
      password: "required",
    });
    let matched = await validation.check();
    if (!matched) {
      return response.returnFalse(
        req,
        res,
        401,
        helper.validationErrorConvertor(validation),
        {}
      );
    }
    const userData = await users.findOne({ email });
    if (userData) {
      if (helper.comparePassword(password, userData.password)) {
       
        const payload = {
          id: userData._id,
          name: userData.name,
        };
        const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 60 minutes
        const jwtToken =  jwt.sign({ ...payload, exp: expirationTime }, process.env.KEY);
        return response.returnTrue(req, res, 200, 'Login successfully', {
          token: jwtToken,
        });
      } else {
        return response.returnFalse(req, res,404, 'Wrong password', {});
      }
    } else {
      return response.returnFalse(req, res,404, 'Email id does not exit.', {});
    }
  } catch (error) {
    console.error("Error login:", error);
    return response.returnFalse(req, res,500, 'Internal server error', {});
  }
};

//-------------------USERs EXCELSHEET CREATION-----------------------

const createExcelSheet = async (req, res) => {
  try {
    const userData = await users.find();

    // Create a new Excel workbook and worksheet.
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Details");

    // Define the columns in the Excel sheet.
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Profile Image", key: "profile_img", width: 30 },
    ];

    // Add user details to the worksheet.
    userData.forEach((user) => {
      worksheet.addRow(user);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const excelBase64 = buffer.toString("base64");
    const fileName = `users-${Date.now()}.xlsx`;

   
    // Save the workbook to a file on the server if needed this is only for see how data is stored or not properly instead of this i send the excel data in the response and the frontend developer encode this res data and use as they needed
    workbook.xlsx
      .writeFile(`uploads/excelsheet/${fileName}.xlsx`)
      .then(() => {
        console.log("Excel sheet generated successfully!");
      })
      .catch((error) => {
        console.error("Error generating Excel sheet:", error);
      });
    //
    const excelSheetUrl = `/uploads/excelsheet/${fileName}`;
    return response.returnTrue(req, res,200,'Excel sheet generated successfully!', {
      excelSheetUrl,
    });
  } catch (error) {
    console.error("Error Excel data:", error);
    return response.returnFalse(req, res,500, 'internal server error', {});
  }
};

//------------------USER PDF CREATION ------------------------

const createPdf = async (req, res) => {
  try {
    const userId = req.id;
    console.log(userId);
    const userData = await users.findById(userId);

    if (!userData) {
      return response.returnFalse(req, res,404,'User not found', {});
      
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(`uploads/pdfs/user-${userData._id}.pdf`); // Create a write stream for the PDF file

    // Handle any errors that may occur when creating the write stream
    pdfStream.on('error', (error) => {
      console.error('Error creating PDF file:', error);
      
      return response.returnFalse(req, res,500, 'Error creating PDF file', {});
    });

    // Once the PDF document is written, end the response
    pdfStream.on('finish', () => {
    
const filePath =  `uploads/pdfs/user-${userData._id}.pdf`;
   
      return response.returnTrue(req, res,200,'Excel sheet generated successfully!', {
        filePath,
      });
    });

    // Pipe the PDF document to the write stream
    doc.pipe(pdfStream);

    // Add content to the PDF
    doc.fontSize(16).text('User Details', { align: 'center' });
    doc.fontSize(12).text(`Name: ${userData.name}`);
    doc.fontSize(12).text(`Email: ${userData.email}`);

    // Add the profile image
    if (userData.profile_image) {
      // Assuming userData.profile_image is the URL/path to the image
      doc.image(userData.profile_image, { width: 200, height: 200 });
    }

    // End the PDF document to save it
    doc.end();
  } catch (error) {
    console.error('Error pdf data:', error);
   
    return response.returnFalse(req, res,500, 'Error creating PDF file', {});
  }
};


module.exports = {signup,signin,createExcelSheet,createPdf}