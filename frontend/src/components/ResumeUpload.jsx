
import { useState } from "react";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setAnalysis(null);

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF file.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage("Resume selected successfully!");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setAnalysis(null);
      setMessage("Analyzing your resume with AI...");

      const rawApiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const API_URL = rawApiUrl.replace(/\/+$/, "");

      const response = await fetch(
        `${API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error(`Server returned status ${response.status} (${response.statusText || "Error"})`);
      }

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setAnalysis(data.analysis);
      setMessage("Resume analyzed successfully!");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2>Upload Your Resume</h2>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      {file && <p>Selected file: {file.name}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ marginTop: "15px" }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      <p>{message}</p>

      {analysis && (
        <div style={{ textAlign: "left", marginTop: "30px" }}>
          <h2>Resume Analysis Results</h2>

          <h3>Technical Skills</h3>
          <ul>
            {analysis.technical_skills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Soft Skills</h3>
          <ul>
            {analysis.soft_skills?.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Education</h3>
          <pre>{JSON.stringify(analysis.education, null, 2)}</pre>

          <h3>Experience</h3>
          <pre>{JSON.stringify(analysis.experience, null, 2)}</pre>

          <h3>Projects</h3>
          <pre>{JSON.stringify(analysis.projects, null, 2)}</pre>

          <h3>Strengths</h3>
          <ul>
            {analysis.strengths?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Weaknesses</h3>
          <ul>
            {analysis.weaknesses?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Missing Information</h3>
          <ul>
            {analysis.missing_information?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h3>Improvement Suggestions</h3>
          <ul>
            {analysis.suggestions?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
