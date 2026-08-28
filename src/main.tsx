import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { DreamProvider } from "./context/DreamContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <DreamProvider>
        <App />
      </DreamProvider>
    </BrowserRouter>
  </StrictMode>
);
