import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgetPassword.css";
import logo from '../../assets/images/logo.png';
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { forgetPasswordMotion } from "../../variants";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@dubaipolice\.gov\.ae$/;
        return emailPattern.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            toast.error("Invalid email");
            return;
        }

        console.log("Password reset link sent to", email);
        toast.success("Password reset link sent!");
    };

    return (
        <Motion.div
            className="forget-password-container"
            initial="hidden"
            animate="visible"
            variants={forgetPasswordMotion}
        >
            <div className="forget-password-left">
                <img src={logo} alt="FlowSync" className="forget-password-logo" />
                <h2 className="forget-password-title">Reset Your Password</h2>
                <p className="forget-password-subtitle">Enter your email to receive a password reset link</p>
            </div>
            <div className="forget-password-right">
                <form onSubmit={handleSubmit} className="forget-password-form">
                    <h2 className="form-title">Forgot Password</h2>
                    <small className="required">* = required field</small>
                    <input type="email" name="email" placeholder="* Enter Your Email" value={email} onChange={handleChange} className="forget-password-input" />
                    <input type="submit" value="Send Reset Link" className="forget-password-button"/>
                    <p className="login-option">Remembered your password? <Link to="/login" className="link">Log in</Link></p>
                </form>
            </div>
        </Motion.div>
    );
};

export default ForgetPassword;