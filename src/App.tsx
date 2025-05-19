import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/home";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import AuthWrapper from "./components/auth/AuthWrapper";
import TaskManagement from "./components/dashboard/TaskManagement";
import CategoryManagement from "./components/dashboard/CategoryManagement";
import MentalBankGrowth from "./components/dashboard/MentalBankGrowth";
import JournalManagement from "./components/journal/JournalManagement";
import GoalDashboard from "./components/goals/GoalDashboard";
import ProfilePage from "./pages/ProfilePage";
import JournalPage from "./pages/JournalPage";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <>
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}
      <Routes>
        <Route
          path="/"
          element={
            <AuthWrapper>
              <Home />
            </AuthWrapper>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/tasks/*"
          element={
            <AuthWrapper>
              <TaskManagement />
            </AuthWrapper>
          }
        />
        <Route
          path="/categories/*"
          element={
            <AuthWrapper>
              <CategoryManagement />
            </AuthWrapper>
          }
        />
        <Route
          path="/growth/*"
          element={
            <AuthWrapper>
              <MentalBankGrowth />
            </AuthWrapper>
          }
        />
        <Route
          path="/journal"
          element={
            <AuthWrapper>
              <JournalPage />
            </AuthWrapper>
          }
        />
        <Route
          path="/journal/:id"
          element={
            <AuthWrapper>
              <JournalManagement />
            </AuthWrapper>
          }
        />
        <Route
          path="/goals/*"
          element={
            <AuthWrapper>
              <GoalDashboard />
            </AuthWrapper>
          }
        />
        <Route
          path="/profile/*"
          element={
            <AuthWrapper>
              <ProfilePage />
            </AuthWrapper>
          }
        />
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
