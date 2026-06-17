import React, { useState } from "react";
import "./LoginSignup.css";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { login } from "../../redux/authSlice";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

const SignupForm = ({ formData, setFormData, loading, setLoading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm({ defaultValues: formData });

  const handlePic = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "Joinin");
      data.append("cloud_name", "divrqv1q7");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/divrqv1q7/image/upload",
        { method: "POST", body: data }
      );

      const upload = await res.json();
      console.log("Uploaded:", upload);
      setFormData((prev) => ({ ...prev, profilePic: upload.secure_url || "" }));
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let res = await fetch("http://localhost:3000/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          adminId: data.empId,
          department: data.department,
          password: data.password,
          phoneNumber: data.phone,
          profilePic: formData.profilePic,
        }),
      });
      const result = await res.json();
      if (res.status === 201) {
        const token = result.token;
        if (!token) return;

        const jwtToken = jwtDecode(token);
        dispatch(login({ user: result.adminInfo, token: jwtToken }));
        toast.success("Registration successful!");
        reset();
        navigate("/amendments");
      } else {
        toast.error(result.message || "Registration failed!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Registration error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="auth-form"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="signup-grid">
        <input {...register("name", { required: true })} placeholder="Full Name" />
        <input {...register("email", { required: true })} type="email" placeholder="Official Email" />
        <input {...register("empId", { required: true })} placeholder="Employee ID" />
        <input {...register("department", { required: true })} placeholder="Department / Designation" />
        <input {...register("phone", { required: true })} type="tel" placeholder="Phone Number" />
        <input {...register("password", { required: true })} type="password" placeholder="Password" />
        <input {...register("confirmPassword", { required: true })} type="password" placeholder="Confirm Password" />
        <input type="file" name="profilePic" onChange={handlePic} />
        <button type="submit" className="submit-btn">
          {loading ? <CircularProgress size={22} /> : "Sign Up"}
        </button>
      </div>
    </motion.form>
  );
};

const LoginSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    empId: "",
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
  });
  const { register, handleSubmit } = useForm();

  const onLoginSubmit = async (data) => {
    setLoading(true);
    try {
      let res = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (res.status === 200) {
        const token = body.token;
        const jwtToken = jwtDecode(token);
        dispatch(login({ user: body.adminInfo, token: jwtToken }));
        toast.success("Login successful!");
        navigate("/amendments");
      } else {
        toast.error(body.message || "Invalid credentials!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Login error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        className="auth-box glass-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="auth-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1828/1828490.png"
            alt="logo"
            className="logo"
          />
          <h1 className="app-title">S.A.R.A</h1>
          <p className="subtitle">Sentiment Analysis & Reporting Assistant</p>
        </div>

        <motion.div
          className="card glass-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{isLogin ? "Secure Login" : "Administrator Registration"}</h2>
          <p className="card-subtitle">
            {isLogin
              ? "Enter your credentials to access your dashboard."
              : "Create an account for MCA Admins"}
          </p>

          {isLogin ? (
            <form className="auth-form" onSubmit={handleSubmit(onLoginSubmit)}>
              <input {...register("adminId", { required: true })} placeholder="Admin ID" />
              <input {...register("password", { required: true })} type="password" placeholder="Password" />
              <button type="submit" className="submit-btn">
                {loading ? <CircularProgress size={22} /> : "Login"}
              </button>
            </form>
          ) : (
            <SignupForm
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              setLoading={setLoading}
            />
          )}

          <p className="switch-text">
            {isLogin ? "Don’t have login credentials?" : "Already have an account?"}{" "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Click here" : "Log in"}
            </span>
          </p>
        </motion.div>

        <footer className="footer">© 2025 S.A.R.A. All rights reserved.</footer>
      </motion.div>
    </div>
  );
};

export default LoginSignup;