import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { DarkModeProvider } from "./contexts/ThemeContext";
import { AccountProvider } from "./contexts/AccountContext";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <DarkModeProvider>
    <AccountProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AccountProvider>
  </DarkModeProvider>
);
