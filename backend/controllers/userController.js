const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
//Register user

exports.registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "This is a sample id",
      url: "profile pic url",
    },
  });

  sendToken(user, 201, res);
};

//Login User

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  //checking user is valid or not
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }

  sendToken(user, 200, res);
};

//Logout
exports.logout = async (req, res, next) => {
  try {
    await res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    //get reset password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then ignore it`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Demo password recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPassword = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPassword: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler("Reset password token is invalid or expired", 404)
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(
        new ErrorHandler("password and confirm password not match", 404)
      );
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPassword = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Get user detail
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    console.log(user);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Change password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 404));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password is not match", 404));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email
    }

    //We Will add cloudinary later
    const user = await User.findByIdAndUpdate(req.user.id, userData, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    })

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Get all user (Admin)
exports.getAllUser = async (req, res, next) => {
  try {
    
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Get Single user (Admin)
exports.getSingleUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);

    if(!user) {
      return new ErrorHandler(`User does not exist ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Update user profile (Admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    })

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};

//Delete user profile (Admin)
exports.deleteUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if(!user) {
      return new ErrorHandler(`User does not exist ${req.params.id}`);
    }

    await user.remove();
    // we will remove cloudnary
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somthing went wrong",
    });
  }
};