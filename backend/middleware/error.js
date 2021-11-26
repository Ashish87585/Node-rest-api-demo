const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";


  //Wrong mongo db id error
  if(err.name === "CastError") {
    const message = `Resourse not found. Invalid path: ${err.path}`;
    err = new ErrorHandler(message, 400)
  }

  //Mongoose duplicate key
  if(err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400)
  }

  //Wrong JWT error
  if(err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid`;
    err = new ErrorHandler(message, 400)
  }

  // JWT Expired error
  if(err.name === "TokenExpiredError") {
    const message = `Json web token is expired`;
    err = new ErrorHandler(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
