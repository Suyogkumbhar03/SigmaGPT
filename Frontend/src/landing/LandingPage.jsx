import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ArrowRight, 
  Code, 
  MessageSquare, 
  PenTool, 
  History, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Check, 
  Copy,
  ChevronRight,
  Bot
} from "lucide-react";
import { MyContext } from "../../MyContext";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: Bot,
    title: "Intelligent AI Conversations",
    desc: "Natural, context-aware dialogue that grasps nuance and retains conversation memory for coherent multi-turn discussions.",
  },
  {
    icon: Code,
    title: "Coding & Technical Assistance",
    desc: "Generate clean code, debug syntax and logic errors, and get instant explanations across Python, JavaScript, Go, and more.",
  },
  {
    icon: PenTool,
    title: "Writing & Productivity",
    desc: "Draft polished documentation, summarize complex research, rewrite content, and streamline your daily writing tasks.",
  },
  {
    icon: History,
    title: "Persistent Conversation History",
    desc: "Keep all your thoughts organized. Search, revisit, and continue previous discussions whenever you need them.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign in seamlessly with Google in one click. No credit card or tedious setup required.",
  },
  {
    step: "02",
    title: "Ask your question",
    desc: "Type your query naturally. Ask for code solutions, explanations, creative drafts, or step-by-step problem solving.",
  },
  {
    step: "03",
    title: "Explore and iterate",
    desc: "Receive clear, accurate answers. Dive deeper with follow-up questions and save your workflow in organized threads.",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { theme, setTheme, user, authLoading } = useContext(MyContext) || { theme: "dark", setTheme: () => {} };

  // Redirect to chat if logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/chat", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (setTheme) setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`lp-root ${theme}`}>
      {/* ── Navigation Bar ── */}
      <header className={`lp-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="lp-nav-container">
          <div className="lp-nav-left" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="lp-brand-logo">
              <span className="lp-brand-symbol">Σ</span>
            </div>
            <span className="lp-brand-name">SigmaGPT</span>
          </div>

          <nav className="lp-nav-links">
            <button onClick={() => scrollTo("features")} className="lp-nav-link">
              Features
            </button>
            <button onClick={() => scrollTo("how-it-works")} className="lp-nav-link">
              How It Works
            </button>
          </nav>

          <div className="lp-nav-actions">
            <button 
              className="lp-theme-btn" 
              onClick={toggleTheme} 
              aria-label="Toggle color theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <button className="lp-btn-primary" onClick={() => navigate("/chat")}>
                Go to Chat <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="lp-btn-ghost" onClick={() => navigate("/signin")}>
                  Sign In
                </button>
                <button className="lp-btn-primary" onClick={() => navigate("/chat")}>
                  Get Started <ArrowRight size={16} />
                </button>
              </>
            )}

            <button 
              className="lp-menu-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lp-mobile-dropdown">
            <button onClick={() => scrollTo("features")} className="lp-mobile-link">
              Features
            </button>
            <button onClick={() => scrollTo("how-it-works")} className="lp-mobile-link">
              How It Works
            </button>
            <div className="lp-mobile-divider"></div>
            {user ? (
              <button className="lp-btn-primary lp-mobile-cta" onClick={() => navigate("/chat")}>
                Go to Chat <ArrowRight size={16} />
              </button>
            ) : (
              <div className="lp-mobile-auth-group">
                <button className="lp-btn-ghost" onClick={() => navigate("/signin")}>
                  Sign In
                </button>
                <button className="lp-btn-primary" onClick={() => navigate("/chat")}>
                  Get Started <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Hero Section ── */}
      <section className="lp-hero-section">
        <div className="lp-hero-container">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <Sparkles size={14} className="lp-badge-icon" />
              <span>Intelligent Conversational AI</span>
            </div>

            <h1 className="lp-hero-headline">
              Your AI workspace for{" "}
              <span className="lp-accent-highlight">thinking, creating,</span> and solving.
            </h1>

            <p className="lp-hero-description">
              SigmaGPT accelerates your workflow with fast, context-aware intelligence. 
              Draft complex code, analyze technical concepts, brainstorm ideas, and solve 
              hard problems effortlessly.
            </p>

            <div className="lp-hero-cta-group">
              <button className="lp-btn-hero-primary" onClick={() => navigate("/chat")}>
                <span>Start Chatting Free</span>
                <ArrowRight size={16} />
              </button>
              <button className="lp-btn-hero-secondary" onClick={() => scrollTo("features")}>
                Explore Features
              </button>
            </div>

            <div className="lp-hero-meta">
              <span className="lp-meta-item">
                <Check size={14} className="lp-check-icon" /> Free instant access
              </span>
              <span className="lp-meta-item">
                <Check size={14} className="lp-check-icon" /> High-speed inference
              </span>
              <span className="lp-meta-item">
                <Check size={14} className="lp-check-icon" /> Code syntax highlighting
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Interactive-Looking Product Preview */}
          <div className="lp-hero-preview-wrapper">
            <div className="lp-chat-card-preview">
              {/* Card Header */}
              <div className="lp-preview-topbar">
                <div className="lp-preview-dots">
                  <span className="lp-dot dot-red"></span>
                  <span className="lp-dot dot-yellow"></span>
                  <span className="lp-dot dot-green"></span>
                </div>
                <div className="lp-preview-model-badge">
                  <span className="lp-pulse-dot"></span>
                  <span>Sigma-4 Turbo</span>
                </div>
                <div className="lp-preview-meta-tag">Thread Active</div>
              </div>

              {/* Card Chat Area */}
              <div className="lp-preview-messages">
                {/* User Prompt */}
                <div className="lp-preview-row user">
                  <div className="lp-preview-bubble user">
                    Can you write a debounce function in TypeScript with cancel support?
                  </div>
                </div>

                {/* AI Response */}
                <div className="lp-preview-row ai">
                  <div className="lp-preview-ai-header">
                    <div className="lp-ai-avatar">Σ</div>
                    <span className="lp-ai-name">SigmaGPT</span>
                  </div>
                  <div className="lp-preview-bubble ai">
                    <p className="lp-preview-text">
                      Here is a type-safe, production-ready debounce utility with a `.cancel()` method:
                    </p>
                    
                    <div className="lp-preview-codeblock">
                      <div className="lp-code-header">
                        <span className="lp-code-lang">typescript</span>
                        <button className="lp-copy-code-btn" onClick={handleCopyCode}>
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre>
                        <code>
{`function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}`}
                        </code>
                      </pre>
                    </div>

                    <p className="lp-preview-footnote">
                      ✓ Zero external dependencies &nbsp;•&nbsp; Clean timer cleanup
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Composer */}
              <div className="lp-preview-composer">
                <div className="lp-preview-input-field">
                  <span className="lp-preview-placeholder">Ask follow-up question...</span>
                  <div className="lp-preview-send-btn">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="lp-section lp-features-section" id="features">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Core Features</span>
            <h2 className="lp-section-title">Designed for clarity, focus, and speed</h2>
            <p className="lp-section-subtitle">
              Every detail is engineered to make your interaction frictionless, whether you are coding, 
              writing, or learning something new.
            </p>
          </div>

          <div className="lp-features-grid">
            {FEATURES.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div className="lp-feature-card" key={index}>
                  <div className="lp-feature-icon-wrapper">
                    <IconComp size={22} className="lp-feature-icon" />
                  </div>
                  <h3 className="lp-feature-title">{item.title}</h3>
                  <p className="lp-feature-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="lp-section lp-hiw-section" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Simple Workflow</span>
            <h2 className="lp-section-title">From question to clarity in three steps</h2>
            <p className="lp-section-subtitle">
              Get started in seconds and enjoy an uninterrupted, distraction-free environment.
            </p>
          </div>

          <div className="lp-steps-grid">
            {STEPS.map((s, index) => (
              <div className="lp-step-card" key={index}>
                <div className="lp-step-number">{s.step}</div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-card">
            <h2 className="lp-cta-title">Ready to experience smarter conversation?</h2>
            <p className="lp-cta-desc">
              Join SigmaGPT today and transform how you brainstorm, code, and solve daily challenges.
            </p>
            <div className="lp-cta-actions">
              <button 
                className="lp-btn-hero-primary" 
                onClick={() => navigate("/chat")}
              >
                <span>{user ? "Open Chat" : "Try 3 Free Prompts"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-nav-left">
                <div className="lp-brand-logo">
                  <span className="lp-brand-symbol">Σ</span>
                </div>
                <span className="lp-brand-name">SigmaGPT</span>
              </div>
              <p className="lp-footer-tagline">
                The modern AI workspace built for thoughtful thinking, coding, and problem solving.
              </p>
            </div>

            <div className="lp-footer-links-group">
              <div className="lp-footer-col">
                <h4>Product</h4>
                <button onClick={() => scrollTo("features")}>Features</button>
                <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
                <button onClick={() => navigate(user ? "/chat" : "/signin")}>Chat Workspace</button>
              </div>

              <div className="lp-footer-col">
                <h4>Legal & Privacy</h4>
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
                <a href="#security" onClick={(e) => e.preventDefault()}>Security</a>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p>© {new Date().getFullYear()} SigmaGPT. All rights reserved.</p>
            <div className="lp-footer-credits">
              <span>Production Quality AI Assistant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
