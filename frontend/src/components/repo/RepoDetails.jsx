import React, { useState, useEffect } from "react";
import axios from "axios";
import "./repo.css";
import { API_BASE_URL } from "../../config";

const RepoDetails = ({ repoId, onClose }) => {
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);

  // States for uploading a new file inside this repo
  const [addingFile, setAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchRepoDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/repo/${repoId}`);
      setRepo(res.data);

      // Parse repository content into structured files
      const contentList = res.data.content || [];
      const parsedFiles = contentList.map((str, idx) => {
        try {
          const parsed = JSON.parse(str);
          if (parsed && parsed.name) {
            return {
              id: idx,
              name: parsed.name,
              content: parsed.content || "",
            };
          }
        } catch (e) {
          // If not JSON, treat it as a raw text file
          return {
            id: idx,
            name: `file_${idx + 1}.txt`,
            content: str,
          };
        }
        return {
          id: idx,
          name: `file_${idx + 1}.txt`,
          content: str,
        };
      });

      setFiles(parsedFiles);
      if (parsedFiles.length > 0) {
        setSelectedFile(parsedFiles[0]);
      } else {
        setSelectedFile(null);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching repository details: ", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoId) {
      fetchRepoDetails();
    }
  }, [repoId]);

  const handleLocalFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewFileName(file.name);
      setNewFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleAddFileSubmit = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      alert("File name is required!");
      return;
    }

    try {
      setUploadLoading(true);
      const fileData = JSON.stringify({
        name: newFileName.trim(),
        content: newFileContent,
      });

      // Call the update endpoint to push this file onto the repository's content array
      await axios.put(`${API_BASE_URL}/repo/update/${repoId}`, {
        content: fileData,
      });

      alert("File added successfully!");
      setNewFileName("");
      setNewFileContent("");
      setAddingFile(false);
      setUploadLoading(false);
      
      // Refresh files list
      fetchRepoDetails();
    } catch (err) {
      console.error("Error adding file to repository: ", err);
      alert("Failed to add file!");
      setUploadLoading(false);
    }
  };

  if (!repoId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="repo-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h3>{loading ? "Loading Repository..." : repo.name}</h3>
            {!loading && <p>{repo.description || "No description provided."}</p>}
          </div>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {loading ? (
          <div className="no-file-selected">
            <span>⏳</span>
            <p>Fetching files, please wait...</p>
          </div>
        ) : (
          <div className="modal-content-grid">
            {/* Sidebar with file tree explorer */}
            <div className="explorer-sidebar">
              <div>
                <button 
                  className="follow-btn" 
                  style={{ marginBottom: "16px", height: "34px", fontSize: "0.85rem" }}
                  onClick={() => {
                    setAddingFile(true);
                    setSelectedFile(null);
                  }}
                >
                  ➕ New File
                </button>
              </div>

              <div className="file-tree-list">
                <h3>Files</h3>
                {files.length === 0 ? (
                  <p style={{ fontSize: "0.85rem", color: "#8b949e", margin: "10px 0" }}>
                    No files uploaded yet.
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className={`file-tree-item ${
                        selectedFile && selectedFile.id === file.id && !addingFile ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedFile(file);
                        setAddingFile(false);
                      }}
                    >
                      📄 {file.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main content display pane */}
            <div className="code-viewer-body">
              {addingFile ? (
                /* Add a new file panel */
                <form className="create-repo-card" style={{ padding: "24px", gap: "20px" }} onSubmit={handleAddFileSubmit}>
                  <h3 style={{ margin: 0 }}>Add New File</h3>
                  
                  <div className="form-group">
                    <label>Upload local file</label>
                    <input 
                      type="file" 
                      onChange={handleLocalFileUpload} 
                      style={{ color: "#adbac7", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div className="form-group">
                    <label>File Name</label>
                    <input
                      type="text"
                      placeholder="e.g. index.js"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>File Content</label>
                    <textarea
                      placeholder="Type or paste file contents here..."
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      style={{ minHeight: "200px", fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                      className="login-btn" 
                      style={{ background: "#238636" }} 
                      type="submit"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? "Saving File..." : "Save File"}
                    </button>
                    <button 
                      className="login-btn" 
                      style={{ background: "rgba(240, 246, 252, 0.05)", color: "#adbac7", border: "1px solid rgba(240, 246, 252, 0.1)" }}
                      onClick={() => {
                        setAddingFile(false);
                        if (files.length > 0) setSelectedFile(files[0]);
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selectedFile ? (
                /* Selected File Content Viewer */
                <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
                  <div className="code-viewer-header">
                    <span>📄 {selectedFile.name}</span>
                  </div>
                  <pre className="code-preview-pane">
                    <code>{selectedFile.content || "// File is empty"}</code>
                  </pre>
                </div>
              ) : (
                /* Empty state of explorer */
                <div className="no-file-selected">
                  <span>📂</span>
                  <h3>Welcome to the File Explorer</h3>
                  <p>Select a file from the sidebar to preview its code contents, or click "New File" to add files to this repository.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoDetails;
