import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import { UserProfileProvider } from '@/hooks/useUserProfile'
import { Toaster } from '@/components/ui/sonner'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildTrack - Construction Inventory Management | B&B Concrete",
  description: "Professional construction inventory and project management system for B&B Concrete. Track materials, manage projects, and optimize operations.",
  icons: {
    icon: "/bb-logo.svg",
    shortcut: "/bb-logo.svg",
    apple: "/bb-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
      afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#000000",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#000000"
        }
      }}
    >
      <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden max-w-full`}
        >
          <UserProfileProvider>
            {children}
          </UserProfileProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
