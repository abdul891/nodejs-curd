const express = require("express");
const {createTask,getAllTask,editTask,deleteTask,deleteMultipleTasks} = require('../controller/taskController');
const upload = require("../common/uploadFile");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post(
  "/create",
  upload.single("task_attachment"),
  authMiddleware.authenticateToken,
  createTask
);
router.get(
  "/all",
  authMiddleware.authenticateToken,
  getAllTask
);
router.put(
  "/edit/:id",
  authMiddleware.authenticateToken,
  upload.single("task_attachment"),
  editTask
);
router.delete(
  "/delete/:id",
  authMiddleware.authenticateToken,
 deleteTask
);
router.delete(
  "/delete/",
  authMiddleware.authenticateToken,
  deleteMultipleTasks
);
module.exports = router;
