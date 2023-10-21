const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname == "profile_img") {
      cb(null, "./uploads/user");
    } else if (file.fieldname == "task_attachment") {
      cb(null, "./uploads/attachments");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
