let returnTrue = (req, res,status, message, arr) =>
  res.status(status).json({ success: true, message: message, data: arr });

let returnFalse = (req, res,status,message, arr) =>
  res.status(status).json({ success: false, message: message, data: arr });

let response = {
  returnFalse: returnFalse,
  returnTrue: returnTrue,
};

module.exports = response;
