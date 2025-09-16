import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const isDevelopment = import.meta.env.DEV;

const AppWithOptionalStrictMode = () => {
  const content = (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/"
      signUpUrl="/"
      afterSignInUrl="/"
      afterSignUpUrl="/"
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
