const Yup = require("yup");

const validschema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(3, "Username must be 3 characters"),
  email: Yup.string()
    .email("Email is not valid")
    .required("Email required"),
  password: Yup.string()
    .min(6, "Password must be 6 characters")
    .required("Password is required"),
});

const validateUser = (validschema) => async (req, res, next) => {
  try {
    await validschema.validate(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { validschema, validateUser };
