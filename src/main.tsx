import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.error("❌ Missing Clerk Publishable Key! Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
  console.log("🔧 Using placeholder key - authentication will not work but app will load");
}

const isDevelopment = import.meta.env.DEV;

const AppWithOptionalStrictMode = () => {
  const content = (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/"
      signUpUrl="/"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <App />
    </ClerkProvider>
  );

  // Only use StrictMode in development to avoid double renders in production
  return isDevelopment ? (
    <React.StrictMode>{content}</React.StrictMode>
  ) : (
    content
  );
};

createRoot(document.getElementById("root")!).render(<AppWithOptionalStrictMode />);
