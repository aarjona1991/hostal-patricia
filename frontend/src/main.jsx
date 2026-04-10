import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SessionProvider } from "./lib/SessionProvider.jsx";
import "@splidejs/react-splide/css";
import "./styles/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <SessionProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || undefined}>
        <App />
      </BrowserRouter>
    </SessionProvider>
  </React.StrictMode>
);

