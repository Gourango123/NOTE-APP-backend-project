require("dotenv").config();
const { verifyEmail } = require("../emailVerify/user.email");
const User = require("../models/user.model");
const Session = require("../models/session.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { route } = require("../routers/user.route");
const { sendOtpMail } = require("../emailVerify/sendotpmail");

// register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This user is already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    // Send verification email
    await verifyEmail(token, email, name);

    newUser.token = token;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// email verify user
exports.verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired!",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed!",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verification successful!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify your account then login",
      });
    }

    // Delete old session
    await Session.deleteOne({ userid: user._id });

    // Create new session
    await Session.create({ userid: user._id });

    // Generate tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });

    user.isLogin = true;
    // user.password = undefined; // hide password
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.name}`,
      accessToken,
      refreshToken,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// logout user
exports.logout = async (req, res) => {
  try {
    const userId = req.userId;
    await Session.deleteMany(userId);
    await User.findByIdAndUpdate(userId, { isLogin: false });
    return res.status(200).json({
      success: true,
      message: "Logout successfully !",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found !",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = expire;
    await user.save();
    await sendOtpMail(email, otp);
    return res.status(200).json({
      success: true,
      message: "send otp to email",
      otp: otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// verify otp
exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const email = req.params.email;
  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "otp is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated or Already Verified",
      });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired and request a new OTP",
      });
    }
    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "oinvaild OTP",
      });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: " OTP Verify Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// password change
exports.passwordChange = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const email = req.params.email;
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required ",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password do not match ",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "user not found !"
      });
    }
    const hashPassword = await bcrypt.hash(newPassword,10);
    user.password = hashPassword ;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password change successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
