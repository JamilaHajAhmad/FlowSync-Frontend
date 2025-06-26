import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import logo from '../../../assets/images/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { loginMotion } from "../../../variants";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { decodeToken } from '../../../utils';
import { login as loginApi } from '../../../services/authService';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';

const Login = () => {
    const navigate = useNavigate();
    const [ showPassword, setShowPassword ] = useState(false);

    useEffect(() => {
        document.title = "FlowSync | Login";
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .required('Email is required')
            .email('Invalid email address'),
        password: Yup.string()
            .required('Password is required')
    });

    const handleNavigation = async (decodedToken, userData) => {
        const is2FAEnabled = localStorage.getItem('is2FAEnabled');
        
        if (is2FAEnabled === 'true') {
            navigate('/settings/security/verify');
            return;
        }
        if (decodedToken.role.includes('Leader') || decodedToken.role.includes('Admin')) {
            toast.success(`Welcome, ${userData.displayName}!`);
            navigate('/leader-dashboard');
        } else {
            toast.success(`Welcome, ${userData.displayName}!`);
            navigate('/member-dashboard');
        }
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await loginApi(values);
                const token = response.data.token;
                localStorage.setItem('authToken', token);
                const decodedToken = decodeToken(token);
                if (!decodedToken) {
                    toast.error('Invalid token received');
                    return;
                }
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                await handleNavigation(decodedToken, userData);
            } catch (error) {
                console.error('Login error:', error);
                const errorMsg = error.response?.data || 'Login failed. Please try again.';
                toast.error(errorMsg);
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
            className="login-container"
            initial="hidden"
            animate="visible"
            variants={loginMotion}
        >
            <div className="login-left">
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

                    <p className="signup-option" style={{ color: 'black', fontWeight: 'bold' }}>
                        Don't have an account? <Link to="/register" className="link">Sign up</Link>
                    </p>
                </form>
            </div>
        </Motion.div>
    );
};
export default Login;
