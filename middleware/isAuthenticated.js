require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
exports.isAuthenticated = async (req, res , next ) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(400).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(400).json({
            success: false,
            message:
              "Access token has expired. Use refresh token to generate again.",
          });
        }

        return res.status(400).json({
          success: false,
          message: "Invalid token",
        });
      }

      const { id } = decoded;
      const user = await User.findById(id);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: " user not found",
        });
      }
      req.userId = user._id;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
