import { useState, useEffect, useRef, useContext } from "react";
import "./LandingPage.css";
import { MyContext } from "../../MyContext";

/* ─── Data ─────────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    title: "Create Your Account",
    desc: "Sign up in seconds — no credit card needed. Start exploring with a free account instantly.",
  },
  {
    num: "02",
    title: "Ask Anything",
    desc: "Type your question, task, or idea. SigmaGPT understands natural language just like you speak.",
  },
  {
    num: "03",
    title: "Get Intelligent Answers",
    desc: "Receive detailed, accurate, and context-aware responses — then dive deeper with follow-up questions.",
  },
];

/* ─── Main Component ────────────────────────────────────── */
function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useContext(MyContext) || { theme: 'dark', setTheme: () => { } };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="lp-root">

      {/* ── NAVBAR ── */}
      <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo" onClick={() => scrollTo("hero")}>
            <img src="/src/assets/sigmagpt_logo.png" alt="SigmaGPT" style={{height: '32px', width: '32px', objectFit: 'contain', borderRadius: '8px'}} />
            SigmaGPT
          </div>

          <ul className="lp-nav-links">
            <li><a onClick={() => scrollTo("how-it-works")}>How It Works</a></li>
          </ul>

          <div className="lp-nav-right">
            <button className="lp-btn-ghost" onClick={toggleTheme} aria-label="Toggle theme" style={{ padding: '9px 12px' }}>
              {theme === "dark" ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
            </button>
            <button className="lp-btn-ghost" onClick={() => window.location.href = "/signin"}>
              Sign In
            </button>
            <button className="lp-btn-primary" onClick={() => window.location.href = "/signin"}>
              Get Started <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <button className="lp-nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`lp-mobile-menu${mobileOpen ? " open" : ""}`}>
          <a onClick={() => scrollTo("how-it-works")}>How It Works</a>
          <button className="lp-btn-primary lp-mobile-menu-cta" onClick={() => window.location.href = "/signin"}>
            Get Started <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-grid-bg"></div>
        <div className="lp-hero-inner">
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot"></span>
              Now Powered by Advanced AI
            </div>
            <h1 className="lp-hero-title">
              Your Smartest{" "}
              <span className="lp-text-gradient">AI Companion</span>
              {" "}for Every Question
            </h1>
            <p className="lp-hero-sub">
              SigmaGPT is an intelligent conversational assistant that helps you learn faster,
              create better, and solve harder problems — in seconds.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn-hero" onClick={() => window.location.href = "/signin"}>
                Start for Free <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button className="lp-btn-hero-outline" onClick={() => scrollTo("how-it-works")}>
                <i className="fa-solid fa-play"></i> See What It Can Do
              </button>
            </div>
          </div>

          <div className="lp-hero-visual">
            <div className="lp-orb lp-orb-1"></div>
            <div className="lp-orb lp-orb-2"></div>
            <div className="lp-chat-mockup">
              <div className="lp-mockup-bar">
                <div className="lp-mockup-dot"></div>
                <div className="lp-mockup-dot"></div>
                <div className="lp-mockup-dot"></div>
                <span className="lp-mockup-title">SigmaGPT — New Chat</span>
              </div>
              <div className="lp-mockup-body">
                <div className="lp-mockup-msg user">
                  <div className="lp-mockup-avatar">Y</div>
                  <div className="lp-mockup-bubble">Explain quantum entanglement simply</div>
                </div>
                <div className="lp-mockup-msg ai">
                  <div className="lp-mockup-avatar"><i className="fa-solid fa-sigma"></i></div>
                  <div className="lp-mockup-bubble">
                    Quantum entanglement is when two particles become linked — measuring one instantly
                    affects the other, no matter how far apart they are.<span className="lp-mockup-cursor"></span>
                  </div>
                </div>
                <div className="lp-mockup-msg user">
                  <div className="lp-mockup-avatar">Y</div>
                  <div className="lp-mockup-bubble">Can you write a Python function for binary search?</div>
                </div>
                <div className="lp-mockup-msg ai">
                  <div className="lp-mockup-avatar"><i className="fa-solid fa-sigma"></i></div>
                  <div className="lp-mockup-bubble">
                    Sure! Here's a clean binary search in Python — O(log n) time complexity...
                  </div>
                </div>
              </div>
              <div className="lp-mockup-input-row">
                <span className="lp-mockup-input-text">Ask anything…</span>
                <div className="lp-mockup-send"><i className="fa-solid fa-paper-plane"></i></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-hiw lp-section" id="how-it-works">
        <div className="lp-container">
          <div className="lp-hiw-inner">
            <div>
              <div className="lp-section-label">
                <i className="fa-solid fa-map"></i> Process
              </div>
              <h2 className="lp-section-title">
                Up & Running in{" "}
                <span className="lp-text-gradient">3 Simple Steps</span>
              </h2>
              <div className="lp-hiw-steps">
                {STEPS.map((s, i) => (
                  <div className="lp-hiw-step" key={i}>
                    <span className="lp-hiw-step-num">{s.num}</span>
                    <div className="lp-hiw-step-content">
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-terminal">
              <div className="lp-terminal-bar">
                <div className="lp-terminal-dot"></div>
                <div className="lp-terminal-dot"></div>
                <div className="lp-terminal-dot"></div>
                <span className="lp-terminal-label">sigma-session</span>
              </div>
              <div className="lp-terminal-body">
                <div className="lp-t-line">
                  <span className="lp-t-prompt">$</span>
                  <span className="lp-t-cmd">sigma init --session "my-first-chat"</span>
                </div>
                <span className="lp-t-out lp-t-success">✓ Session created</span>
                <span className="lp-t-out lp-t-success">✓ Context loaded</span>
                <br />
                <div className="lp-t-line">
                  <span className="lp-t-prompt">$</span>
                  <span className="lp-t-cmd">sigma ask "Explain recursion"</span>
                </div>
                <span className="lp-t-out lp-t-purple">→ Recursion is a function that</span>
                <span className="lp-t-out lp-t-purple">&nbsp;&nbsp;calls itself to solve smaller</span>
                <span className="lp-t-out lp-t-purple">&nbsp;&nbsp;versions of the same problem.</span>
                <br />
                <div className="lp-t-line">
                  <span className="lp-t-prompt">$</span>
                  <span className="lp-t-cmd">sigma code --lang python "fibonacci"</span>
                </div>
                <span className="lp-t-out lp-t-cyan">def fibonacci(n):</span>
                <span className="lp-t-out lp-t-cyan">&nbsp;&nbsp;if n &lt;= 1: return n</span>
                <span className="lp-t-out lp-t-cyan">&nbsp;&nbsp;return fibonacci(n-1) + fibonacci(n-2)</span>
                <br />
                <div className="lp-t-line">
                  <span className="lp-t-prompt">$</span>
                  <span className="lp-t-cmd lp-t-success">Done.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-nav-logo">
                <img src="/src/assets/sigmagpt_logo.png" alt="SigmaGPT" style={{height: '32px', width: '32px', objectFit: 'contain', borderRadius: '8px'}} />
                SigmaGPT
              </div>
              <p>
                The AI assistant that helps you learn, create, and solve problems —
                faster than ever before.
              </p>
              <div className="lp-footer-socials">
                <div className="lp-footer-social-icon"><i className="fa-brands fa-twitter"></i></div>
                <div className="lp-footer-social-icon"><i className="fa-brands fa-github"></i></div>
                <div className="lp-footer-social-icon"><i className="fa-brands fa-linkedin-in"></i></div>
                <div className="lp-footer-social-icon"><i className="fa-brands fa-discord"></i></div>
              </div>
            </div>

            <div className="lp-footer-col">
              <h4>Product</h4>
              <ul>
                <li><a onClick={() => scrollTo("how-it-works")}>How It Works</a></li>
                <li><a>Changelog</a></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a>About Us</a></li>
                <li><a>Careers</a></li>
                <li><a>Blog</a></li>
                <li><a>Press Kit</a></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>Support</h4>
              <ul>

                <li><a>Contact Us</a></li>
                <li><a>Privacy Policy</a></li>
                <li><a>Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} SigmaGPT · Made with ❤️ by Apna College</span>
            <div className="lp-footer-bottom-links">
              <a>Privacy</a>
              <a>Terms</a>
              <a>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
