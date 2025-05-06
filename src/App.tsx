import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ProfilePage from "./pages/ProfilePage";
import routes from "tempo-routes";
import AuthWrapper from "./components/auth/AuthWrapper";
import Header from "./components/dashboard/Header";

// Lazy load components for better performance
const TaskManagement = lazy(
  () => import("./components/dashboard/TaskManagement"),
);
const CategoryManagement = lazy(
  () => import("./components/dashboard/CategoryManagement"),
);
const MentalBankGrowth = lazy(
  () => import("./components/dashboard/MentalBankGrowth"),
);
const GoalDashboard = lazy(() => import("./components/goals/GoalDashboard"));
const JournalManagement = lazy(
  () => import("./components/journal/JournalManagement"),
);

// Auth pages
const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const SignupPage = lazy(() => import("./components/auth/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("./components/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("./components/auth/ResetPasswordPage"),
);

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthWrapper>
              <>
                <Header />
                <main className="container mx-auto p-4 pt-6">
                  {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tasks" element={<TaskManagement />} />
                    <Route
                      path="/categories"
                      element={<CategoryManagement />}
                    />
                    <Route path="/charts" element={<MentalBankGrowth />} />
                    <Route path="/goals" element={<GoalDashboard />} />
                    <Route path="/journal" element={<JournalManagement />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    {import.meta.env.VITE_TEMPO === "true" && (
                      <Route path="/tempobook/*" />
                    )}
                  </Routes>
                </main>
              </>
            </AuthWrapper>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
