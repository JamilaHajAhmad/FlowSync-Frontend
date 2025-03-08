import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './components/Landing/Landing';
import Register from './components/auth/Register/Register';
import Login from './components/auth/Login/Login';
import ForgetPassword from './components/auth/ForgetPassword/ForgetPassword';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgetPassword />} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;