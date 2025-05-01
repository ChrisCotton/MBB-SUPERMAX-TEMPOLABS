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

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthWrapper>
        <>
          <Header />
          <main className="container mx-auto p-4 pt-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tasks" element={<TaskManagement />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/charts" element={<MentalBankGrowth />} />
              <Route path="/goals" element={<GoalDashboard />} />
              <Route path="/journal" element={<JournalManagement />} />
              <Route path="/profile" element={<ProfilePage />} />
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" />
              )}
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          </main>
        </>
      </AuthWrapper>
    </Suspense>
  );
}

export default App;
