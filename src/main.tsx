import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/contexts/auth";
import App from "@/App";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* Cookieless, privacy-friendly page analytics (Vercel Web Analytics).
          No consent banner needed — no personal data, no cross-site tracking. */}
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
);
