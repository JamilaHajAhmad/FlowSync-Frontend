import { useState, useEffect } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import "./ResetPassword.css";
import logo from '../../../assets/images/logo.png';
import { motion as Motion } from "framer-motion";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { resetPasswordMotion } from "../../../variants";
import { resetPassword as resetPasswordApi } from '../../../services/authService';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';

const ResetPassword = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "FlowSync | Reset Password";
    }, []);
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const userId = queryParams.get("userId");

    const [ showPassword, setShowPassword ] = useState({
        password: false,
        confirmPassword: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [ field ]: !prev[ field ]
        }));
    };

    const validationSchema = Yup.object({
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            ),
        confirmPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf([ Yup.ref('password') ], 'Passwords must match')
    });

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await resetPasswordApi({
                    token: token,
                    userId: userId,
                    newPassword: values.password
                });
                if (response.status === 200) {
                    toast.success('Password has been reset successfully');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                const errorMessage = error.response?.data?.message
                    || 'Failed to reset password. Please try again.';
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
            className="reset-password-container"
            initial="hidden"
            animate="visible"
            variants={resetPasswordMotion}
        >
            <div className="reset-password-left">
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
                <img src={logo} alt="FlowSync" className="reset-password-logo" />
                <h2 className="reset-password-title">Reset Your Password</h2>
                <p className="reset-password-subtitle">Enter your new password</p>
            </div>
            <div className="reset-password-right">
                <form onSubmit={formik.handleSubmit} className="reset-password-form">
                    <h2 className="form-title">Reset Password</h2>

                    <div className="password-field">
                        <input
                            type={showPassword.password ? "text" : "password"}
                            name="password"
                            placeholder="New Password"
                            {...formik.getFieldProps('password')}
                            className={`reset-password-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('password')}
                        >
                            {showPassword.password ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <div className="error-message">{formik.errors.password}</div>
                    )}

                    <div className="password-field">
                        <input
                            type={showPassword.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm New Password"
                            {...formik.getFieldProps('confirmPassword')}
                            className={`reset-password-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}`}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                            {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <div className="error-message">{formik.errors.confirmPassword}</div>
                    )}

                    <button
                        type="submit"
                        className="reset-password-button"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p className="login-option" style={{ fontWeight: 'bold' }}>
                        Remembered your password? <Link to="/login" className="link">Log in</Link>
                    </p>
                </form>
            </div>
        </Motion.div>
    );
};
export default ResetPassword;
