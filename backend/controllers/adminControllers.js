const connectDB = require("../database"); 
const bcrypt = require("bcrypt");
const Admin = require("../Schemas/adminSchema");
const jwt = require("jsonwebtoken");
const Amndement = require("../Schemas/report");

// ✅ Register Admin
const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      adminId,
      department,
      password,
      phoneNumber,
      profilePic,
    } = req.body;

    await connectDB();

    const existing = await Admin.find({ email: email, adminId: adminId });
    if (existing.length > 0) {
      return res.status(409).json({ message: "Admin has already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = new Admin({
      fullName,
      email,
      adminId,
      department,
      password: hashed,
      phoneNumber,
      profilePic,
    });

    await admin.save();

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Admin registered successfully!",
      token,
      adminInfo: { fullName, email, department,profilePic },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Login Admin
const login = async (req, res) => {
  const { adminId, password } = req.body;

  try {
    await connectDB();

    const existing = await Admin.find({ adminId: adminId });
    if (!existing.length) {
      return res.status(401).json({ message: "Invalid adminId or password" });
    }

    const user = existing[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      adminInfo: {
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        profilePic:user.profilePic
      },
    });
  } catch (e) {
    res.status(500).json({ error: "error occurred", detail: e.message });
  }
};


// ✅ Export correctly
module.exports = { register, login };