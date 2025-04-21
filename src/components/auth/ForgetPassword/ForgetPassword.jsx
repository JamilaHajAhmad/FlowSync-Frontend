import React from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgetPassword.css";
import logo from '../../../assets/images/logo.png';
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { forgetPasswordMotion } from "../../../variants";

const ForgetPassword = () => {

    // Validation Schema
    const validationSchema = Yup.object({
        email: Yup.string()
            .required('Email is required')
            .email('Invalid email format')
    });

    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await axios.post(
                    'https://localhost:55914/forgot-password',
                    { email: values.email }
                );

                if (response.status === 200) {
                    toast.success('Password reset link has been sent to your email');
                }
            } catch (error) {
                console.error('Error sending reset link:', error);
                const errorMessage = error.response?.data?.message
                    || 'Failed to send reset link. Please try again.';
                toast.error(errorMessage);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Motion.div
            className="forget-password-container"
            initial="hidden"
            animate="visible"
            variants={forgetPasswordMotion}
        >
            <div className="forget-password-left">
                <img src={logo} alt="FlowSync" className="forget-password-logo" />
                <h2 className="forget-password-title">Forgot Your Password</h2>
                <p className="forget-password-subtitle">Enter your email to receive a password reset link</p>
            </div>
            <div className="forget-password-right">
                <form onSubmit={formik.handleSubmit} className="forget-password-form">
                    <h2 className="form-title">Forgot Password ?</h2>
                    
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="E-mail" 
                        {...formik.getFieldProps('email')}
                        className={`forget-password-input ${
                            formik.touched.email && formik.errors.email ? 'error' : ''
                        }`}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="error-message">{formik.errors.email}</div>
                    )}

                    <button 
                        type="submit" 
                        className="forget-password-button"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Sending...' : 'Send'}
                    </button>

                    <p className="login-option" style={{ color: 'black' }}>
                        Remembered your password? <Link to="/login" className="link">Log in</Link>
                    </p>
                </form>
            </div>
        </Motion.div>
    );
};

export default ForgetPassword;