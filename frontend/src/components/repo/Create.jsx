import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import "./repo.css";
import { API_BASE_URL } from "../../config";

const Create = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true); // true = Public, false = Private
  const [loading, setLoading] = useState(false);

  // File staging states
  const [stagedFiles, setStagedFiles] = useState([]);
  const [manualFileName, setManualFileName] = useState("");
  const [manualFileContent, setManualFileContent] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleNameChange = (e) => {
    // Convert to standard URL-friendly repository slug name
    const formattedVal = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-") // Replace invalid characters with dash
      .replace(/-+/g, "-"); // Collapse duplicate dashes
    setName(formattedVal);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Avoid staging duplicate file names
      if (stagedFiles.some((f) => f.name === file.name)) {
        alert("A file with this name is already staged!");
        return;
      }

      setStagedFiles([
        ...stagedFiles,
        {
          name: file.name,
          content: event.target.result,
        },
      ]);
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = "";
  };

  const handleManualFileAdd = (e) => {
    e.preventDefault();
    if (!manualFileName.trim()) {
      alert("Please enter a file name!");
      return;
    }

    const cleanName = manualFileName.trim();
    if (stagedFiles.some((f) => f.name === cleanName)) {
      alert("A file with this name is already staged!");
      return;
    }

    setStagedFiles([
      ...stagedFiles,
      {
        name: cleanName,
        content: manualFileContent,
      },
    ]);

    setManualFileName("");
    setManualFileContent("");
    setShowManualEntry(false);
  };

  const handleRemoveStagedFile = (idxToRemove) => {
    setStagedFiles(stagedFiles.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Repository name is required!");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in first!");
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);

      // Serialize staged files into the 'content' array
      const contentList = stagedFiles.map((file) => JSON.stringify(file));

      const payload = {
        owner: userId,
        name: name.trim(),
        description: description.trim(),
        visibility: visibility,
        content: contentList,
      };

      await axios.post(`${API_BASE_URL}/repo/create`, payload);

      alert("Repository created successfully!");
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error("Error creating repository: ", err);
      alert(err.response?.data?.error || "Failed to create repository!");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-repo-container">
        <form className="create-repo-card" onSubmit={handleSubmit}>
          <div className="create-repo-header">
            <h2>Create a new repository</h2>
            <p>A repository contains all project files, including the revision history.</p>
          </div>

          {/* Repository Name */}
          <div className="form-group">
            <label htmlFor="repo-name">Repository name *</label>
            <input
              id="repo-name"
              type="text"
              placeholder="e.g. my-awesome-project"
              value={name}
              onChange={handleNameChange}
              required
              autoComplete="off"
            />
            <span style={{ fontSize: "0.8rem", color: "#8b949e" }}>
              Repository names must be lowercase, alphanumeric, and URL-friendly.
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="repo-desc">Description <span style={{ fontWeight: 400, color: "#8b949e" }}>(optional)</span></label>
            <textarea
              id="repo-desc"
              placeholder="Briefly describe your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Visibility options */}
          <div className="form-group">
            <label>Select visibility</label>
            <div className="visibility-options">
              <div
                className={`visibility-card ${visibility ? "selected" : ""}`}
                onClick={() => setVisibility(true)}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === true}
                  onChange={() => setVisibility(true)}
                />
                <div className="visibility-info">
                  <h4>Public</h4>
                  <p>Anyone on the internet can see this repository. You choose who can commit.</p>
                </div>
              </div>

              <div
                className={`visibility-card ${!visibility ? "selected" : ""}`}
                onClick={() => setVisibility(false)}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === false}
                  onChange={() => setVisibility(false)}
                />
                <div className="visibility-info">
                  <h4>Private</h4>
                  <p>You choose who can see and commit to this repository.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Staged files upload area */}
          <div className="file-upload-section">
            <div className="create-repo-header" style={{ marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", margin: 0 }}>Add initial files</h3>
              <p>Upload text files or draft new ones to populate your repository immediately.</p>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <label className="file-upload-box" style={{ flexGrow: 1 }}>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.md,.txt,.py,.go,.java,.cpp,.c,.sh"
                />
                <p>📤 Choose a text file to upload</p>
                <span>Supports code, text, markdown, or JSON files.</span>
              </label>

              <div
                className="file-upload-box"
                style={{ flexGrow: 1 }}
                onClick={() => setShowManualEntry(!showManualEntry)}
              >
                <p>✍️ Create virtual file</p>
                <span>Draft a file manually in our online text editor.</span>
              </div>
            </div>

            {/* Virtual file creator */}
            {showManualEntry && (
              <div className="manual-file-entry">
                <h4>Draft virtual file</h4>
                <div className="manual-file-inputs">
                  <input
                    type="text"
                    placeholder="File name (e.g. README.md)"
                    value={manualFileName}
                    onChange={(e) => setManualFileName(e.target.value)}
                  />
                  <button className="login-btn" style={{ height: "36px", fontSize: "0.85rem", background: "#1f6feb" }} onClick={handleManualFileAdd}>
                    Add
                  </button>
                </div>
                <textarea
                  placeholder="File content..."
                  value={manualFileContent}
                  onChange={(e) => setManualFileContent(e.target.value)}
                  style={{ minHeight: "120px", fontFamily: "monospace" }}
                />
              </div>
            )}

            {/* List of staged files */}
            {stagedFiles.length > 0 && (
              <div className="staged-files-container">
                <h4>Staged files ({stagedFiles.length})</h4>
                <div className="staged-files-list">
                  {stagedFiles.map((file, idx) => (
                    <div key={idx} className="staged-file-item">
                      <span>📄 {file.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => handleRemoveStagedFile(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ borderTop: "1px solid rgba(240, 246, 252, 0.08)", paddingTop: "24px" }}>
            <button
              className="login-btn"
              style={{ background: "#238636", height: "42px", fontSize: "1rem" }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Repository..." : "Create Repository"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Create;
