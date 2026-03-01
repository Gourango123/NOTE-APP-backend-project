require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

exports.verifyEmail = async (token, email ,name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

     // ⭐ Template read
    const source = fs.readFileSync( path.join(__dirname, "../template/verifyEmail.hbs"),
  "utf8");

    // ⭐ Compile template
    const template = handlebars.compile(source);

    const link = `https://note-app-frontend-project.vercel.app/verify/${token}`;

    // ⭐ HTML with data
    const html = template({ name, link });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html:html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully! Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.log("Error sending email:", error.message);
    throw error;
  }
};
