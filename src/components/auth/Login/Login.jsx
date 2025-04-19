import React, { useState } from "react"; // Update the import
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Add this import
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import logo from '../../../assets/images/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { loginMotion } from "../../../variants";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { decodeToken } from '../../../utils';

const Login = () => {
    const navigate = useNavigate();
    const [ showPassword, setShowPassword ] = useState(false); // Add this state

    // Add toggle function
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Validation Schema using Yup
    const validationSchema = Yup.object({
        email: Yup.string()
            .required('Email is required')
            .email('Invalid email address'),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await axios.post('https://localhost:55914/login', values);

                // Store token in localStorage
                const token = response.data.token;
                localStorage.setItem('authToken', token);

                // Decode token to get user information
                const decodedToken = decodeToken(token);
                if (!decodedToken) {
                    toast.error('Invalid token received');
                    return;
                }

                // Store user info
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));

                // Handle navigation based on role and status
                if (decodedToken.role === 'Leader') { // Team Leader
                    toast.success(`Welcome back, ${userData.displayName}!`);
                    navigate('/leader-dashboard');
                    console.log(decodedToken)
                } else { // Team Member
                    toast.success(`Welcome back, ${userData.displayName}!`);
                    navigate('/member-dashboard');
                    console.log(decodedToken)
                }
            } catch (error) {
                console.error('Login error:', error);
                const errorMsg = error.response.data|| 'Login failed. Please try again.';
                toast.error(errorMsg);
            } finally {
                setSubmitting(false);
            }
        }
    });

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
                <form onSubmit={formik.handleSubmit} className="login-form">
                    <h2 className="form-title">Login Now</h2>

                    <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        {...formik.getFieldProps('email')}
                        className={`login-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="error-message">{formik.errors.email}</div>
                    )}

                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            {...formik.getFieldProps('password')}
                            className={`login-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <div className="error-message">{formik.errors.password}</div>
                    )}

                    <Link to="/forgot-password" className="forgot-password-link">
                        Forgot Password?
                    </Link>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>

                    <p className="signup-option">
                        Don't have an account? <Link to="/register" className="link">Sign up</Link>
                    </p>
                </form>
            </div>
        </Motion.div>
    );
};

export default Login;
