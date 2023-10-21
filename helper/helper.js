const bcrypt = require("bcrypt");
const moment = require("moment/moment");
const jwt = require("jsonwebtoken");

module.exports = {
  comparePassword: (inputPass, dbPass) => bcrypt.compareSync(inputPass, dbPass),
  convertIntoTimeStamp: (date) => moment(date).valueOf(),
  checkValidDate: (date) => {
    const providedDate = moment(date, "YYYY-MM-DD");
    const currentDate = moment();
    return providedDate.isAfter(currentDate);
  },

  encryptPassword: async (password) => {
    let salt = await bcrypt.genSalt(10);
    let encryptedPass = await bcrypt.hash(password, salt);
    return encryptedPass;
  },
  validationErrorConvertor: (validation) => {
    var error;
    for (var i = 0; i <= Object.values(validation.errors).length; i++) {
      error = Object.values(validation.errors)[0].message;
      break;
    }
    return error;
  },
};
