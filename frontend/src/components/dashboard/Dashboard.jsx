import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Navbar from "../Navbar";
import RepoDetails from "../repo/RepoDetails";
import { API_BASE_URL } from "../../config";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  // State for opening the repository detail modal
  const [selectedRepoId, setSelectedRepoId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/repo/user/${userId}`
        );
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fecthing repositories: ", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fecthing repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    const repos = repositories || [];
    if (searchQuery == "") {
      setSearchResults(repos);
    } else {
      const filteredRepo = repos.filter((repo) =>
        repo.name && repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {(suggestedRepositories || []).map((repo) => {
            return (
              <div 
                key={repo._id} 
                onClick={() => setSelectedRepoId(repo._id)}
                style={{ cursor: "pointer" }}
              >
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            );
          })}
        </aside>
        <main>
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {(searchResults || []).map((repo) => {
            return (
              <div 
                key={repo._id} 
                onClick={() => setSelectedRepoId(repo._id)}
                style={{ cursor: "pointer" }}
              >
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            );
          })}
        </main>
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>

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

export default Dashboard;
