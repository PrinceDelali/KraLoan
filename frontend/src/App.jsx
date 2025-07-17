import React from "react";
import NotificationProvider from "./components/NotificationProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import HomePage from "./HomePage";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import PrivateRoute from "./PrivateRoute";
import CreateGroup from "./CreateGroup";
import Features from "./Features";
import About from "./About";
import Contact from "./Contact";
import ForgotPassword from "./ForgotPassword";
import InviteLanding from "./InviteLanding";
import GroupDetails from "./GroupDetails";
import GroupDashboard from "./GroupDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/invite/:token" element={<InviteLanding />} />
        <Route path="/dashboard/:tab?" element={
  <PrivateRoute>
    <Dashboard key={window.location.pathname} />
  </PrivateRoute>
} />
        <Route path="/group/:groupId" element={<GroupDetails />} />
        <Route path="/group-dashboard/:groupId" element={<GroupDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default function WrappedApp() {
  return (
    <NotificationProvider>
      <App />
    </NotificationProvider>
  );
}

// For hot reload compatibility
export { WrappedApp as App };

