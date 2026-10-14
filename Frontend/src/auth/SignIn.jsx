import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, ArrowLeft, AlertCircle } from "lucide-react";
import { MyContext } from "../../MyContext";
import { supabase } from "../supabaseClient";
import "./SignIn.css";

function SignIn() {
  const navigate = useNavigate();
  const { theme, setTheme, user, authLoading } = useContext(MyContext) || { theme: "dark", setTheme: () => {} };
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-redirect if user is already signed in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/chat", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (setTheme) setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setErrorMessage("");
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!url || !key) {
      setErrorMessage("Configuration error: Supabase URL and anon key are missing in the frontend .env file.");
      return;
    }

    setLoading(true);
    sessionStorage.setItem("oauth_in_progress", "true");
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        sessionStorage.removeItem("oauth_in_progress");
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      sessionStorage.removeItem("oauth_in_progress");
      setErrorMessage(err.message || "Failed to initialize Google Sign In. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={`auth-root ${theme}`}>
      {/* Top Bar with Home & Theme Toggle */}
      <header className="auth-topbar">
        <button className="auth-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <button 
          className="auth-theme-btn" 
          onClick={toggleTheme} 
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Centered Auth Card */}
      <main className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-brand-logo">
              <span className="auth-brand-symbol">Σ</span>
            </div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your SigmaGPT account to continue</p>
          </div>

          {errorMessage && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} className="auth-error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="auth-card-body">
            <button
              className="auth-google-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              {loading ? (
                <div className="auth-spinner"></div>
              ) : (
                <svg className="auth-google-svg" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>
          </div>

          <div className="auth-card-footer">
            <p className="auth-terms-text">
              By continuing, you agree to SigmaGPT's{" "}
              <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>{" "}
              and{" "}
              <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignIn;
