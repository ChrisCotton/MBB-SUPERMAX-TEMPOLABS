import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import ProfilePage from "./pages/ProfilePage";
import routes from "tempo-routes";
import AuthWrapper from "./components/auth/AuthWrapper";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthWrapper>
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </AuthWrapper>
    </Suspense>
  );
}

export default App;
