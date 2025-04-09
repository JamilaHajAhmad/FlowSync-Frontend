import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Calendar from './components/teamLeader/dashboard/components/Calendar';
import ProfilePage from './components/common/profile/ProfilePage';
import MHome from './components/teamMember/dashboard/components/MHome';
import MTasks from './components/teamMember/dashboard/components/MTasks';
import MCalendar from './components/teamMember/dashboard/components/MCalendar';
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
import ChatbotButton from './components/common/chat/ChatbotButton';
import FAQ from './components/teamMember/dashboard/components/FAQ';
import FeedbackSupport from './components/teamMember/dashboard/components/FeedbackSupport';

const App = () => {
    return (
        <NotificationProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgetPassword />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/team" element={<Members />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/dashboard" element={<MHome />} />
                    <Route path="/tasks" element={<MTasks />} />
                    <Route path="/calendar" element={<MCalendar />} />
                    <Route path="/freeze-task" element={<FreezeTask />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/settings/edit-profile" element={<EditProfile />} />
                    <Route path="/settings/Change-password" element={<ChangePW />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/analytics/bar" element={<Layout children={<Bar />} />} />
                    <Route path="/analytics/line" element={<Layout children={<Line />} />} />
                    <Route path="/analytics/pie" element={<Layout children={<Pie />} />} />
                    <Route path="/analytics/stream" element={<Layout children={<Stream />} />} />
                    <Route path="/analytics/stacked" element={<Layout children={<Stacked />} />} />
                    <Route path="/analytics/heatmap" element={<Layout children={<HeatMap />} />} />
                    <Route path="/notifications" element={<NotificationsPage />}  />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/feedback&support" element={<FeedbackSupport />} />
                </Routes>
                <ToastContainer />
                <ChatbotButton />
                {/* Add any other components that should be present on all pages */}
            </BrowserRouter>
        </NotificationProvider>
    );
}

export default App;