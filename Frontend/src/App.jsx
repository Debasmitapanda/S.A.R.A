import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "./components/LoginSignup/LoginSignup";
import Amendments from "./Amendments";
import CommentsPage from "./CommentsPage";
import AmendmentReport from "./AmendmentReport";
import SettingsPage from "./SettingsPage";
import PopUp from "./components/PopUp";

function App() {
  // Temporary auth state and later we’ll replace this with real backend JWT/session logic
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <Router>
      <Routes>
        {/*For Public route */}
        <Route
          path="/"
          element={<LoginSignup onLogin={() => setIsAuthenticated(true)} />}
        />

        {/*For Protected route */}
        <Route
          path="/amendments"
          element={
            isAuthenticated ? (
              <Amendments />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/amendments/comments"
          element={
            isAuthenticated ? (
              <CommentsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/amendments/comments/report"
          element={
            isAuthenticated ? (
              <AmendmentReport />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <SettingsPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/amendments/comments/report/popup" element={<PopUp />} />

        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;