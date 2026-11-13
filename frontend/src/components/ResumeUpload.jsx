import { useState, useRef, useEffect } from "react";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // 'info' | 'error' | 'success'
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Loading step simulation for engaging feedback
  useEffect(() => {
    let interval = null;
    if (loading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const loadingMessages = [
    "Uploading document securely...",
    "Extracting text & formatting with PyMuPDF...",
    "Consulting Gemini AI for ATS & skill intelligence...",
    "Finalizing actionable career insights...",
  ];

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setAnalysis(null);
    setMessage("");

    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Please select a valid PDF file.");
      setStatusType("error");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("File size exceeds 5 MB limit. Please upload a smaller PDF.");
      setStatusType("error");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage(`Ready to analyze: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`);
    setStatusType("info");
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume PDF first.");
      setStatusType("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setAnalysis(null);
      setMessage("");

      const rawApiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const API_URL = rawApiUrl.replace(/\/+$/, "");

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Server returned HTTP ${response.status} (${response.statusText || "Unexpected error"})`);
      }

      if (!response.ok) {
        throw new Error(data.detail || "Analysis request failed.");
      }

      setAnalysis(data.analysis);
      setMessage("Resume analyzed successfully!");
      setStatusType("success");
      setActiveTab("overview");

    } catch (error) {
      setMessage(error.message || "Something went wrong while analyzing the resume.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    if (bytes < k * k) {
      return (bytes / k).toFixed(1) + " KB";
    }
    return (bytes / (k * k)).toFixed(2) + " MB";
  };

  // Calculate dynamic resume score
  const calculateScore = () => {
    if (!analysis) return 0;
    let score = 60;
    if (analysis.technical_skills?.length > 4) score += 10;
    if (analysis.projects?.length > 1) score += 10;
    if (analysis.experience?.length > 0) score += 10;
    if (analysis.strengths?.length > 3) score += 5;
    if (analysis.missing_information?.length > 3) score -= 8;
    return Math.min(Math.max(score, 45), 96);
  };

  // Helper to render complex items (experience, projects, education) whether string or object
  const renderItemCard = (item, index, defaultTitle = "Item") => {
    if (typeof item === "string") {
      return (
        <div key={index} className="item-card">
          <p className="item-desc">{item}</p>
        </div>
      );
    }

    if (typeof item === "object" && item !== null) {
      const title = item.title || item.role || item.degree || item.name || `${defaultTitle} #${index + 1}`;
      const subtitle = item.company || item.institution || item.organization || item.technologies || item.tech_stack || "";
      const date = item.duration || item.year || item.period || item.date || "";
      const description = item.description || item.responsibilities || item.details || item.summary || "";

      return (
        <div key={index} className="item-card">
          <div className="item-header">
            <div>
              <h4 className="item-title">{title}</h4>
              {subtitle && (
                <div className="item-subtitle">
                  {Array.isArray(subtitle) ? subtitle.join(" • ") : subtitle}
                </div>
              )}
            </div>
            {date && <span className="item-date">{date}</span>}
          </div>

          {Array.isArray(description) ? (
            <ul className="bullet-list" style={{ marginTop: "10px" }}>
              {description.map((b, i) => (
                <li key={i} className="bullet-item">
                  <span className="bullet-icon">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : description ? (
            <p className="item-desc" style={{ marginTop: "8px" }}>{description}</p>
          ) : null}

          {/* Any other custom key-values */}
          {Object.entries(item).map(([key, val]) => {
            if (["title", "role", "degree", "name", "company", "institution", "duration", "year", "period", "date", "description", "responsibilities", "details", "summary", "technologies", "tech_stack"].includes(key)) {
              return null;
            }
            if (val === null || val === undefined || val === "") return null;
            return (
              <div key={key} style={{ marginTop: "6px", fontSize: "13px", color: "var(--text-secondary)" }}>
                <strong style={{ textTransform: "capitalize", color: "var(--text-muted)" }}>{key.replace(/_/g, " ")}: </strong>
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const resumeScore = calculateScore();

  return (
    <div className="upload-wrapper">
      {/* Upload Box (hidden when results are shown, or can be toggled) */}
      {!analysis && (
        <div className="glass-card no-print">
          <div
            className={`dropzone ${isDragging ? "active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div className="dropzone-icon">📁</div>
            <h3 className="dropzone-title">
              {isDragging ? "Drop your PDF here" : "Click or drag & drop your resume"}
            </h3>
            <p className="dropzone-desc">Supported format: PDF documents only (Max size: 5MB)</p>
            <span className="dropzone-hint">🔒 Secure & confidential • Processed instantly via Gemini AI</span>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="selected-file-card">
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)} • Ready for analysis</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-remove"
                onClick={handleReset}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>{loadingMessages[loadingStep] || "Analyzing with AI..."}</span>
              </>
            ) : (
              <>
                <span>🚀 Analyze Resume with AI</span>
              </>
            )}
          </button>

          {/* Status / Alert Message */}
          {message && (
            <div className={`alert-box ${statusType === "error" ? "alert-error" : "alert-info"}`}>
              <span>{statusType === "error" ? "⚠️" : "ℹ️"}</span>
              <span>{message}</span>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {analysis && (
        <div className="results-section">
          {/* Header Bar */}
          <div className="results-header">
            <h2 className="results-title">
              <span>📊 Resume Intelligence Report</span>
            </h2>

            <div className="results-actions no-print">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
              >
                🖨️ Print / Save PDF
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                ↺ Analyze Another
              </button>
            </div>
          </div>

          {/* Score & KPI Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                🎯
              </div>
              <div>
                <div className="stat-val">{resumeScore}/100</div>
                <div className="stat-label">Resume Health Score</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399" }}>
                💻
              </div>
              <div>
                <div className="stat-val">{analysis.technical_skills?.length || 0}</div>
                <div className="stat-label">Technical Skills</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6" }}>
                🤝
              </div>
              <div>
                <div className="stat-val">{analysis.soft_skills?.length || 0}</div>
                <div className="stat-label">Soft Skills</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                📁
              </div>
              <div>
                <div className="stat-val">{analysis.projects?.length || 0}</div>
                <div className="stat-label">Projects Identified</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs-nav no-print">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              📋 Executive Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => setActiveTab("skills")}
            >
              🛠️ Skills Cloud ({ (analysis.technical_skills?.length || 0) + (analysis.soft_skills?.length || 0) })
            </button>
            <button
              className={`tab-btn ${activeTab === "experience" ? "active" : ""}`}
              onClick={() => setActiveTab("experience")}
            >
              💼 Experience & Projects
            </button>
            <button
              className={`tab-btn ${activeTab === "education" ? "active" : ""}`}
              onClick={() => setActiveTab("education")}
            >
              🎓 Education
            </button>
            <button
              className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`}
              onClick={() => setActiveTab("feedback")}
            >
              💡 Recommendations ({analysis.suggestions?.length || 0})
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="tab-pane">
              {/* Strengths & Weaknesses 2-Column */}
              <div className="comparison-grid">
                <div className="section-card card-strength">
                  <h3 className="section-title" style={{ color: "var(--success-color)" }}>
                    <span>✅ Key Strengths</span>
                  </h3>
                  <ul className="bullet-list">
                    {analysis.strengths && analysis.strengths.length > 0 ? (
                      analysis.strengths.map((str, idx) => (
                        <li key={idx} className="bullet-item">
                          <span className="bullet-icon" style={{ color: "var(--success-color)" }}>✓</span>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="bullet-item">No specific strengths highlighted.</li>
                    )}
                  </ul>
                </div>

                <div className="section-card card-weakness">
                  <h3 className="section-title" style={{ color: "var(--warning-color)" }}>
                    <span>⚠️ Areas for Improvement</span>
                  </h3>
                  <ul className="bullet-list">
                    {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                      analysis.weaknesses.map((w, idx) => (
                        <li key={idx} className="bullet-item">
                          <span className="bullet-icon" style={{ color: "var(--warning-color)" }}>!</span>
                          <span>{w}</span>
                        </li>
                      ))
                    ) : (
                      <li className="bullet-item">No critical weaknesses detected.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Actionable Suggestions Highlights */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="section-card">
                  <h3 className="section-title">
                    <span>🚀 Top Actionable Recommendations</span>
                  </h3>
                  {analysis.suggestions.slice(0, 4).map((sugg, idx) => (
                    <div key={idx} className="suggestion-card">
                      <div className="suggestion-num">{idx + 1}</div>
                      <div className="suggestion-text">{sugg}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILLS */}
          {activeTab === "skills" && (
            <div className="tab-pane">
              <div className="section-card">
                <h3 className="section-title">
                  <span>💻 Technical Skills ({analysis.technical_skills?.length || 0})</span>
                </h3>
                <div className="pills-cloud">
                  {analysis.technical_skills && analysis.technical_skills.length > 0 ? (
                    analysis.technical_skills.map((skill, index) => (
                      <span key={index} className="pill-badge pill-tech">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>No technical skills found.</p>
                  )}
                </div>
              </div>

              <div className="section-card">
                <h3 className="section-title">
                  <span>🤝 Soft Skills ({analysis.soft_skills?.length || 0})</span>
                </h3>
                <div className="pills-cloud">
                  {analysis.soft_skills && analysis.soft_skills.length > 0 ? (
                    analysis.soft_skills.map((skill, index) => (
                      <span key={index} className="pill-badge pill-soft">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>No soft skills found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPERIENCE & PROJECTS */}
          {activeTab === "experience" && (
            <div className="tab-pane">
              <div className="section-card">
                <h3 className="section-title">
                  <span>💼 Work Experience</span>
                </h3>
                <div className="experience-list">
                  {analysis.experience && analysis.experience.length > 0 ? (
                    analysis.experience.map((exp, idx) => renderItemCard(exp, idx, "Position"))
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>No work experience section identified.</p>
                  )}
                </div>
              </div>

              <div className="section-card">
                <h3 className="section-title">
                  <span>🚀 Projects & Portfolio</span>
                </h3>
                <div className="project-list">
                  {analysis.projects && analysis.projects.length > 0 ? (
                    analysis.projects.map((proj, idx) => renderItemCard(proj, idx, "Project"))
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>No projects listed in this resume.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {activeTab === "education" && (
            <div className="tab-pane">
              <div className="section-card">
                <h3 className="section-title">
                  <span>🎓 Educational Background</span>
                </h3>
                <div className="experience-list">
                  {analysis.education && analysis.education.length > 0 ? (
                    analysis.education.map((edu, idx) => renderItemCard(edu, idx, "Qualification"))
                  ) : (
                    <p style={{ color: "var(--text-muted)" }}>No formal education details found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RECOMMENDATIONS & MISSING INFO */}
          {activeTab === "feedback" && (
            <div className="tab-pane">
              <div className="section-card">
                <h3 className="section-title">
                  <span>💡 Improvement Suggestions</span>
                </h3>
                {analysis.suggestions && analysis.suggestions.length > 0 ? (
                  analysis.suggestions.map((sugg, idx) => (
                    <div key={idx} className="suggestion-card">
                      <div className="suggestion-num">{idx + 1}</div>
                      <div className="suggestion-text">{sugg}</div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)" }}>No improvement suggestions needed!</p>
                )}
              </div>

              {analysis.missing_information && analysis.missing_information.length > 0 && (
                <div className="section-card" style={{ borderLeft: "4px solid var(--warning-color)" }}>
                  <h3 className="section-title" style={{ color: "var(--warning-color)" }}>
                    <span>⚠️ Missing or Recommended Information</span>
                  </h3>
                  <ul className="bullet-list">
                    {analysis.missing_information.map((item, idx) => (
                      <li key={idx} className="bullet-item">
                        <span className="bullet-icon" style={{ color: "var(--warning-color)" }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
