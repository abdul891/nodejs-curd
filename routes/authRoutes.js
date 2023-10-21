const express = require("express");
const {signup,signin,createExcelSheet,createPdf} = require('../controller/authController');

const upload = require("../common/uploadFile");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/signup", upload.single("profile_img"), signup);
router.post("/login", signin);
router.get("/export-all-user", createExcelSheet);
router.get("/user-pdf",  authMiddleware.authenticateToken, createPdf);

module.exports = router;
