import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css"; 
import logo from '../../../assets/images/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { loginMotion } from "../../../variants";

const Login = () => {
    const navigate = useNavigate();
    const [ formData, setFormData ] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [ e.target.name ]: e.target.value });
    };

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@dubaipolice\.gov\.ae$/;
        return emailPattern.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let errors = [];

        if (!validateEmail(formData.email)) errors.push("Invalid email");
        if (formData.password.length < 6) errors.push("Password must be at least 6 characters");

        if (errors.length > 0) {
            errors.forEach((error) => toast.error(error));
            return;
        }

        console.log("Login Successful", formData);
        toast.success("Login successful!");
        navigate('/member-dashboard');
    };

    return (
        <Motion.div
            className="login-container"
            initial="hidden"
            animate="visible"
            variants={loginMotion}
        >
            <div className="login-left">
                <img src={logo} alt="FlowSync" className="login-logo" />
                <h2 className="login-title">Welcome Back to FlowSync</h2>
                <p className="login-subtitle">Login to continue managing your team effortlessly</p>
            </div>
            <div className="login-right">
                <form onSubmit={handleSubmit} className="login-form">
                    <h2 className="form-title">Login Now</h2>
                    <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} className="login-input" required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="login-input" required />
                    <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    <input type="submit" value="Sign in" className="login-button"/>
                    <p className="signup-option">Don't have an account? <Link to="/register" className="link">Sign up</Link></p>
                </form>
            </div>
        </Motion.div>
    );
};

export default Login;
