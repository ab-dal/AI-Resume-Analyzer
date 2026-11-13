import ResumeUpload from "./components/ResumeUpload";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      {/* Header / Navbar */}
      <header className="navbar no-print">
        <div className="nav-brand">
          <div className="brand-icon">📄</div>
          <span className="brand-title">ResumeAI</span>
        </div>

        <div className="nav-badge">
          <span className="pulse-dot"></span>
          <span>Gemini 2.5 AI Powered</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-section no-print">
          <div className="hero-pill">
            <span>✨ AI-Powered Career Intelligence</span>
          </div>
          <h1 className="hero-title">
            Land Your Next Role with <span className="gradient-text">Precision Insights</span>
          </h1>
          <p className="hero-subtitle">
            Upload your resume in PDF format to receive instant ATS compatibility analysis,
            deep skill mapping, and actionable recommendations from Google Gemini AI.
          </p>

          <div className="features-strip">
            <span className="feature-tag">⚡ Instant PDF Extraction</span>
            <span className="feature-tag">🎯 ATS Alignment</span>
            <span className="feature-tag">🔍 Skill Gap Discovery</span>
            <span className="feature-tag">💡 Actionable Tips</span>
          </div>
        </section>

        {/* Upload & Results Section */}
        <ResumeUpload />
      </main>

      {/* Footer */}
      <footer className="footer no-print">
        <p>© {new Date().getFullYear()} AI Resume Analyzer. Built with React & Google Gemini AI.</p>
        <p style={{ marginTop: "6px", fontSize: "12px", opacity: 0.7 }}>
          Your files are processed in real-time in memory and never permanently stored.
        </p>
      </footer>
    </div>
  );
}

export default App;
