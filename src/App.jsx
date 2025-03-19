import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './components/Landing/Landing';
import Register from './components/auth/Register/Register';
import Login from './components/auth/Login/Login';
import ForgetPassword from './components/auth/ForgetPassword/ForgetPassword';
import Dashboard from './components/teamLeader/dashboard/components/Dashboard';
import CreateTask from './components/teamLeader/dashboard/components/createTask';
import Tasks from './components/teamLeader/dashboard/components/Tasks';
import Members from './components/teamLeader/dashboard/components/Members';
import Board from './components/teamLeader/dashboard/components/Board';
import Calendar from './components/teamLeader/dashboard/components/Calendar';
import Profile from './components/teamLeader/dashboard/components/Profile';
import MDashboard from './components/teamMember/dashboard/components/MDashboard';
import MTasks from './components/teamMember/dashboard/components/MTasks';
import MBoard from './components/teamMember/dashboard/components/MBoard';
import MProfile from './components/teamMember/dashboard/components/MProfile';
import MCalendar from './components/teamMember/dashboard/components/MCalendar';
import Colleagues from './components/teamMember/dashboard/components/Colleagues';
import FreezeTask from './components/teamMember/dashboard/components/FreezeTask';
import Settings from './components/common/Settings';
import Requests from './components/teamLeader/dashboard/components/Requests';
import EditProfile from './components/common/EditProfile';
import ChangePW from './components/common/ChangePW';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgetPassword />} />
                <Route path="/leader-dashboard" element={<Dashboard />} />
                <Route path="/create-new-task" element={<CreateTask />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/members" element={<Members />} />
                <Route path="/leader-board" element={<Board />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/member-dashboard" element={<MDashboard />} />
                <Route path="/member-tasks" element={<MTasks />} />
                <Route path="/member-board" element={<MBoard />} />
                <Route path="/member-profile" element={<MProfile />} />
                <Route path="/member-calendar" element={<MCalendar />} />
                <Route path="/colleagues" element={<Colleagues />} />
                <Route path="/freeze-task" element={<FreezeTask />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/settings/edit-profile" element={<EditProfile />} />
                <Route path="/settings/Change-password" element={<ChangePW />} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;