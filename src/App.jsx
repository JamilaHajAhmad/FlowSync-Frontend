import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ProtectedRouter } from './routing/protectedRouter';
import { ToastContainer } from 'react-toastify';
import NotificationProvider from "./components/common/notification/NotificationProvider";
import 'react-toastify/dist/ReactToastify.css';
import Landing from './components/Landing/Landing';
import Register from './components/auth/Register/Register';
import Login from './components/auth/Login/Login';
import ForgetPassword from './components/auth/ForgetPassword/ForgetPassword';
import Home from './components/teamLeader/dashboard/components/Home';
import Tasks from './components/teamLeader/dashboard/components/Tasks';
import Members from './components/teamLeader/dashboard/components/Members';
import CalendarPage from './components/common/calendar/CalendarPage';
import ProfilePage from './components/common/profile/ProfilePage';
import MHome from './components/teamMember/dashboard/components/MHome';
import MTasks from './components/teamMember/dashboard/components/MTasks';
import FreezeTask from './components/teamMember/dashboard/components/FreezeTask';
import Settings from './components/common/Settings';
import Requests from './components/teamLeader/dashboard/components/Requests';
import EditProfile from './components/common/EditProfile';
import ChangePW from './components/common/ChangePW';
import Analytics from './components/teamLeader/dashboard/components/Analytics';
import Layout from './components/teamLeader/analytics/layout/Layout';
import Bar from './components/teamLeader/analytics/bar/Bar';
import HeatMap from './components/teamLeader/analytics/heatmap/HeatMap';
import Line from './components/teamLeader/analytics/line/Line';
import Pie from './components/teamLeader/analytics/pie/Pie';
import Stream from './components/teamLeader/analytics/stream/Stream';
import Stacked from './components/teamLeader/analytics/stacked/Stacked';
import NotificationsPage from './components/common/notification/NotificationsPage';
import FAQ from './components/teamMember/dashboard/components/FAQ';
import FeedbackSupport from './components/teamMember/dashboard/components/FeedbackSupport';
import ChatbotButton from './components/common/chat/ChatbotButton';
import ResetPassword from './components/auth/ResetPassword/ResetPassword';

const App = () => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
        <NotificationProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgetPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected routes */}
                    <Route path="/leader-dashboard" element={<ProtectedRouter><Home /></ProtectedRouter>} />
                    <Route path="/team-tasks" element={<ProtectedRouter><Tasks /></ProtectedRouter>} />
                    <Route path="/team" element={<ProtectedRouter><Members /></ProtectedRouter>} />
                    <Route path="/calendar" element={<ProtectedRouter><CalendarPage /></ProtectedRouter>} />
                    <Route path="/profile" element={<ProtectedRouter><ProfilePage /></ProtectedRouter>} />
                    <Route path="/member-dashboard" element={<ProtectedRouter><MHome /></ProtectedRouter>} />
                    <Route path="/member-tasks" element={<ProtectedRouter><MTasks /></ProtectedRouter>} />
                    <Route path="/freeze-task" element={<ProtectedRouter><FreezeTask /></ProtectedRouter>} />
                    <Route path="/settings" element={<ProtectedRouter><Settings /></ProtectedRouter>} />
                    <Route path="/requests" element={<ProtectedRouter><Requests /></ProtectedRouter>} />
                    <Route path="/settings/edit-profile" element={<ProtectedRouter><EditProfile /></ProtectedRouter>} />
                    <Route path="/settings/change-password" element={<ProtectedRouter><ChangePW /></ProtectedRouter>} />
                    <Route path="/analytics" element={<ProtectedRouter><Analytics /></ProtectedRouter>} />
                    <Route path="/analytics/bar" element={<ProtectedRouter><Layout children={<Bar />} /></ProtectedRouter>} />
                    <Route path="/analytics/line" element={<ProtectedRouter><Layout children={<Line />} /></ProtectedRouter>} />
                    <Route path="/analytics/pie" element={<ProtectedRouter><Layout children={<Pie />} /></ProtectedRouter>} />
                    <Route path="/analytics/stream" element={<ProtectedRouter><Layout children={<Stream />} /></ProtectedRouter>} />
                    <Route path="/analytics/stacked" element={<ProtectedRouter><Layout children={<Stacked />} /></ProtectedRouter>} />
                    <Route path="/analytics/heatmap" element={<ProtectedRouter><Layout children={<HeatMap />} /></ProtectedRouter>} />
                    <Route path="/notifications" element={<ProtectedRouter><NotificationsPage /></ProtectedRouter>} />
                    <Route path="/faq" element={<ProtectedRouter><FAQ /></ProtectedRouter>} />
                    <Route path="/feedback&support" element={<ProtectedRouter><FeedbackSupport /></ProtectedRouter>} />
                </Routes>
                <ToastContainer />
            </BrowserRouter>
            <ChatbotButton />
        </NotificationProvider>
        </LocalizationProvider>
    );
};

export default App;