import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./components/Utilities/Navbar";
import Footer from "./components/Utilities/Footer";
import ErrorBoundary from "./components/Utilities/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Utilities/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', 
  preload: true,
});

export const metadata = {
  title: "BillMeNow - Professional Invoicing Made Easy",
  description: "Create professional invoices and manage your billing with ease. Fast, secure, and designed for modern businesses.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      ><ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
