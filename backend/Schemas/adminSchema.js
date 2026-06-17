const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // no duplicate emails
    
  },
  adminId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phoneNumber: {
    type: String,
    default:"9988234152"
  },
  profilePic: {
    type: String, // URL of the uploaded profile picture
    default: "/face.png", // fallback
  },
}, { timestamps: true })

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin