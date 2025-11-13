// src/components/app.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppTheme from "./AppTheme";
import HomePage from "./HomePage";
import EventCreationPage from "./EventCreationPage";
import EventsPage from "./EventsPage";
// import PublicLayout from "../layout/layout"; // opzionale, vedi variante sotto

function App() {
  return (
    <AppTheme>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-event" element={<EventCreationPage />} />
          <Route path="/events" element={<EventsPage />} />
          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppTheme>
  );
}

const container = document.getElementById("app");
if (container) {
  createRoot(container).render(<App />);
} else {
  console.error("Container #app non trovato nel DOM");
}
