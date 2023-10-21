
const response = require("../config/response");
const jwt = require("jsonwebtoken")
require('dotenv').config();
module.exports = middleware = {
  authenticateToken: async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return response.returnFalse(req, res, 400 ,'Token required', {});
    }
    const token = authorizationHeader.replace("Bearer ", "");
    console.log(token);
    try{
      let user = jwt.verify(token,process.env.KEY);
      console.log(user);
      if(user.id)
      {
        req.id = user.id;
        next();
      }
      else{
        return response.returnFalse(req, res, 401, 'unauthorized access', {});
      }
    }
    catch(err){
      if (err instanceof jwt.TokenExpiredError) {
        return response.returnFalse(req, res, 401, 'Token has expired', {});
      } else {
        // Handle other JWT verification errors or unexpected errors here
        console.error(err);
        return response.returnFalse(req, res, 500, 'Internal Server Error', {});
      }
    }
    
  
  },
};
