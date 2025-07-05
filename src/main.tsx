
import React from "react";
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import App from './App.tsx'
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";
import './index.css'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain={Sepolia}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);
