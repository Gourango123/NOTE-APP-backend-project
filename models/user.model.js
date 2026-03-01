const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified:{type:Boolean , default:false},
  isLogin:{type:Boolean , default: false},
  token:{type:String , default:null},
  otp:{type:String , default:null},
  otpExpiry:{type:Date , default:null}
} , {timestamps:true});

module.exports = mongoose.model("User", userSchema);
