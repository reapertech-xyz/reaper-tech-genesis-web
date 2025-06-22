
import React from "react";
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import App from './App.tsx'
import './index.css'

if (import.meta.env.DEV && typeof window !== "undefined") {
  import("@stackbit/sdk").then((sdk) => sdk.default?.() || sdk());
}

createRoot(document.getElementById("root")!).render(<App />);
