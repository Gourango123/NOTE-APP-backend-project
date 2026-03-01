require("dotenv").config();
const nodemailer = require("nodemailer");

exports.sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your password reset OTP is: <br> ${otp}</p>
             <p>It is valid for 5 minutes.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    throw error;
  }
};
