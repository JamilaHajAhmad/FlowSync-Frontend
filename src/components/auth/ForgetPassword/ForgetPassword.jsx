import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ForgetPassword.css";
import logo from '../../../assets/images/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { forgetPasswordMotion } from "../../../variants";
import { forgotPassword as forgotPasswordApi } from '../../../services/authService';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';

const ForgetPassword = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "FlowSync | Forget Password";
    }, []);

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
                const response = await forgotPasswordApi(values.email);
                if (response.status === 200) {
                    toast.success('Password reset link has been sent to your email');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
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

    const handleReturnHome = () => {
        navigate('/');
    };

    return (
        <Motion.div
            className="forget-password-container"
            initial="hidden"
            animate="visible"
            variants={forgetPasswordMotion}
        >
            <div className="forget-password-left">
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleReturnHome}
                    sx={{
                        borderRadius: '30px',
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        alignSelf: 'flex-start',
                        boxShadow: 2,
                        transition: 'all 0.2s',
                        minWidth: { xs: 36, sm: 48 },
                        px: { xs: 1.5, sm: 1.5 },
                        py: { xs: 0.5, sm: 0.5 },
                        background: 'linear-gradient(90deg, #059669 60%, #10b981 100%)',
                        color: '#fff',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #059669 60%, #10b981 100%)',
                            boxShadow: 4,
                        },
                        position: { xs: 'static', md: 'absolute' },
                        top: { md: 35 },
                        left: { md: 32 },
                        mb: { xs: 2, md: 0 },
                        minHeight: 0,
                    }}
                >
                    <Tooltip title="Return Home" arrow>
                        <HomeIcon />
                    </Tooltip>
                </Button>
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
                        className={`forget-password-input ${formik.touched.email && formik.errors.email ? 'error' : ''
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

                    <p className="login-option" style={{ color: 'black', fontWeight: 'bold' }}>
                        Remembered your password? <Link to="/login" className="link">Log in</Link>
                    </p>
                </form>
            </div>
        </Motion.div>
    );
};
export default ForgetPassword;