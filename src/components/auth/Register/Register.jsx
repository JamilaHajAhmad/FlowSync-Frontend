import React, { useState } from "react";
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
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Helper function to convert role string to number
  const convertRoleToNumber = (roleString) => {
    return roleString === 'teamLeader' ? 0 : 1;
  };

  // Validation Schema using Yup
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
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    role: Yup.string()
      .required('Please select a role')
      .oneOf(['teamLeader', 'teamMember'], 'Invalid role selected')
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
        // Convert role to number before sending to API
        const apiValues = {
          ...values,
          role: convertRoleToNumber(values.role)
        };

        console.log('Form submitted:', apiValues);
        const response = await axios.post('https://localhost:49798/register', apiValues);
        
        // Show different messages and navigate based on role
        if (values.role === 'teamLeader') {
          toast.success('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        } else {
          toast.success('Registration successful! Your request is waiting for team leader approval.');
          navigate('/'); // Navigate to landing page for team members
        }

        console.log('Registration response:', response.data);
      } catch (err) {
        console.error('Error registering user:', err.response.data.detail);
        toast.error(err.response.data.detail || 'An error occurred');
      }
    }
  });

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
          
          <p className="login-option" style={{ color: 'black' }}>
            Already have an account? <Link className="link" to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </Motion.div>
  );
};

export default Register;
