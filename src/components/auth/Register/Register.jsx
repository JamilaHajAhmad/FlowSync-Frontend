import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";
import logo from '../../../assets/images/logo.png';
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { registerMotion } from "../../../variants";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "teamMember"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@dubaipolice\.gov\.ae$/;
    return emailPattern.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = [];

    if (!formData.firstName) errors.push("First Name is required");
    if (!formData.lastName) errors.push("Last Name is required");
    if (!validateEmail(formData.email)) errors.push("Invalid email");
    if (formData.password.length < 6) errors.push("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) errors.push("Passwords do not match");

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    console.log("Form Submitted", formData);
    navigate('/leader-dashboard')
  };

  return (
    <Motion.div
      className="register-container"
      initial="hidden"
      animate="visible"
      variants={registerMotion}
    >
      <div className="register-left">
        <img src={logo} alt="FlowSync" className="register-logo" />
        <h2 className="register-title">Join FlowSync</h2>
        <p className="register-text">Sync your team’s workflow effortlessly</p>
      </div>
      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form">
          <h2 className="form-title">Register Now</h2>
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="form-input" required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="form-input" required/>
          <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="form-input" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="form-input" required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className="form-input" required />
          <div className="form-radio-group">
            <label>
              <input type="radio" name="role" value="teamLeader" checked={formData.role === "teamLeader"} onChange={handleChange} />
              Team Leader
            </label>
            <label>
              <input type="radio" name="role" value="teamMember" checked={formData.role === "teamMember"} onChange={handleChange} />
              Team Member
            </label>
          </div>
          <input type="submit" value="Sign Up" className="form-button"/>
          <p className="login-option">Already have an account? <Link className="link" to="/login">Log in</Link></p>
        </form>
      </div>
    </Motion.div>
  );
};

export default Register;
