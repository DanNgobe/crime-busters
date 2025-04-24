import { useAuth } from "@clerk/clerk-react";
import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import LoadingIndicator from "./components/LoadingIndicator";
import MoveNetDetector from "./components/MoveNetDetector";
import { useGetQuery } from "./hooks";
import Dashboard from "./pages/Dashboard";
import SafetyTipsPage from "./pages/SafetyTips";
import SignInPage from "./pages/SignIn";
import ToolsPage from "./pages/ToolsPage";
import UserReportsPage from "./pages/UserReport";
import { User } from "./types";

const App: React.FC = () => {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { data: user, isLoading } = useGetQuery<User>({
    resource: `users/${userId}`,
    queryKey: `users/${userId}`,
  });

  if (!isLoaded || isLoading) {
    return <LoadingIndicator />;
  }

  if (userId) {
    localStorage.setItem("onesignalUserId", userId);
    if (user?.role) {
      localStorage.setItem("onesignalUserRole", user.role);
    }
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/safety-tips" element={<SafetyTipsPage />} />
          <Route path="/my-reports" element={<UserReportsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/test" element={<MoveNetDetector />} />
          <Route path="/sign-in" element={<SignInPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
