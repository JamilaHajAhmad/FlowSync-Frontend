import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Register.css";
import logo from '../../../assets/images/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { registerMotion } from "../../../variants";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { register as registerApi } from '../../../services/authService';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FlowSync | Register";
  }, []);

  const [ showPasswords, setShowPasswords ] = useState({
    password: false,
    confirmPassword: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [ field ]: !prev[ field ]
    }));
  };

  const convertRoleToNumber = (roleString) => {
    return roleString === 'teamLeader' ? 0 : 1;
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('First Name is required')
      .min(3, 'First Name must be at least 3 characters'),
    lastName: Yup.string()
      .required('Last Name is required')
      .min(3, 'Last Name must be at least 3 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([ Yup.ref('password') ], 'Passwords must match'),
    role: Yup.string()
      .required('Please select a role')
      .oneOf([ 'teamLeader', 'teamMember' ], 'Invalid role selected')
  });

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'teamMember'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const apiValues = {
          ...values,
          role: convertRoleToNumber(values.role)
        };
        const response = await registerApi(apiValues);
        console.log(response.data);
        if (values.role === 'teamLeader') {
          toast.success('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        } else {
          toast.success('Registration successful! Your request is waiting for team leader approval.');
          navigate('/');
        }
      } catch (err) {
        toast.error(err.response?.data?.detail || 'An error occurred');
        console.error('Registration error:', err);
      }
    }
  });

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <Motion.div
      className="register-container"
      initial="hidden"
      animate="visible"
      variants={registerMotion}
    >
      <div className="register-left">
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
        <img src={logo} alt="FlowSync" className="register-logo" />
        <h2 className="register-title">Join FlowSync</h2>
        <p className="register-text">Sync your team's workflow effortlessly</p>
      </div>
      <div className="register-right">
        <form onSubmit={formik.handleSubmit} className="register-form">
          <h2 className="form-title">Register Now</h2>

          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            {...formik.getFieldProps('firstName')}
            className={`form-input ${formik.touched.firstName && formik.errors.firstName ? 'error' : ''}`}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <div className="error-message">{formik.errors.firstName}</div>
          )}

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            {...formik.getFieldProps('lastName')}
            className={`form-input ${formik.touched.lastName && formik.errors.lastName ? 'error' : ''}`}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <div className="error-message">{formik.errors.lastName}</div>
          )}

          <input
            type="email"
            name="email"
            placeholder="E-mail"
            {...formik.getFieldProps('email')}
            className={`form-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="error-message">{formik.errors.email}</div>
          )}

          <div className="password-field">
            <input
              type={showPasswords.password ? "text" : "password"}
              name="password"
              placeholder="Password"
              {...formik.getFieldProps('password')}
              className={`form-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('password')}
            >
              {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="error-message">{formik.errors.password}</div>
          )}

          <div className="password-field">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              {...formik.getFieldProps('confirmPassword')}
              className={`form-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}`}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="error-message">{formik.errors.confirmPassword}</div>
          )}

          <div className="form-radio-group">
            <label>
              <input
                type="radio"
                name="role"
                value="teamLeader"
                checked={formik.values.role === "teamLeader"}
                onChange={formik.handleChange}
              />
              Team Leader
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="teamMember"
                checked={formik.values.role === "teamMember"}
                onChange={formik.handleChange}
              />
              Team Member
            </label>
          </div>
          {formik.touched.role && formik.errors.role && (
            <div className="error-message">{formik.errors.role}</div>
          )}

          <button type="submit" className="form-button" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>

          <p className="login-option" style={{ color: 'black', fontWeight: 'bold' }}>
            Already have an account? <Link className="link" to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </Motion.div>
  );
};
export default Register;
