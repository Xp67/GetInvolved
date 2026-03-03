import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";
import EventEdit from "./pages/EventEdit";
import Profile from "./pages/Profile";
import AdminOnboarding from "./pages/AdminOnboarding";
import Navbar from "./components/Navbar";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function Logout() {
    localStorage.clear();
    return <Navigate to="/" />;
}

function AppContent() {
    const location = useLocation();
    const hideNavbar = location.pathname === '/onboarding';

    return (
        <>
            {!hideNavbar && <Navbar />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />

                {/* Onboarding */}
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <AdminOnboarding />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/eventi/:id/edit"
                    element={
                        <ProtectedRoute>
                            <EventEdit />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/eventi/:id"
                    element={
                        <ProtectedRoute>
                            <EventDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;

