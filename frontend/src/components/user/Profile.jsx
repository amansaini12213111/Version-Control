import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";
import RepoDetails from "../repo/RepoDetails";
import { API_BASE_URL } from "../../config";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const { setCurrentUser } = useAuth();
  
  // State for opening repository detail modal
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/userProfile/${userId}`
          );
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <>
      <Navbar />
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item
          aria-current="page"
          icon={BookIcon}
          sx={{
            backgroundColor: "transparent",
            color: "white",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Overview
        </UnderlineNav.Item>

        <UnderlineNav.Item
          onClick={() => navigate("/")}
          icon={RepoIcon}
          sx={{
            backgroundColor: "transparent",
            color: "whitesmoke",
            "&:hover": {
              textDecoration: "underline",
              color: "white",
            },
          }}
        >
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setCurrentUser(null);

          window.location.href = "/auth";
        }}
        style={{ position: "fixed", bottom: "50px", right: "50px" }}
        id="logout"
      >
        Logout
      </button>

      <div className="profile-page-wrapper">
        <div className="user-profile-section">
          <div className="profile-image"></div>

          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="follow-btn">Follow</button>

          <div className="follower">
            <p>10 Follower</p>
            <p>3 Following</p>
          </div>
        </div>

        <div className="heat-map-section" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <HeatMapProfile />

          {/* User's Repositories Grid Section */}
          <div className="heat-map-section" style={{ border: "none", padding: 0, boxShadow: "none" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: 0 }}>
              📂 Public Repositories
            </h4>
            <div className="repo-card-wrapper" style={{ padding: "16px 0 0", justifyContent: "flex-start" }}>
              {(!userDetails.repositories || userDetails.repositories.length === 0) ? (
                <p style={{ color: "#8b949e", fontSize: "0.9rem" }}>No repositories created yet.</p>
              ) : (
                userDetails.repositories.map((repo) => (
                  <div 
                    key={repo._id} 
                    className="repo" 
                    onClick={() => setSelectedRepoId(repo._id)}
                    style={{ 
                      cursor: "pointer", 
                      background: "rgba(22, 27, 34, 0.4)", 
                      borderColor: "rgba(240, 246, 252, 0.08)",
                      transition: "all 0.2s ease" 
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="repo-name" style={{ fontWeight: 600, fontSize: "1.1rem" }}>{repo.name}</span>
                      <p className="description" style={{ margin: 0, fontSize: "0.85rem", color: "#8b949e" }}>{repo.description || "No description provided."}</p>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(240, 246, 252, 0.05)", paddingTop: "12px", marginTop: "12px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#8b949e" }}>
                        {repo.visibility ? "🟢 Public" : "🔴 Private"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#8b949e" }}>
                        📄 {repo.content?.length || 0} files
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Repository Detail Modal */}
      {selectedRepoId && (
        <RepoDetails
          repoId={selectedRepoId}
          onClose={() => setSelectedRepoId(null)}
        />
      )}
    </>
  );
};

export default Profile;
