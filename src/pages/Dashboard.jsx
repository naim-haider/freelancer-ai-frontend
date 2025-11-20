import { useState, useEffect } from "react";
import axios from "axios";
import ProjectSearch from "../components/ProjectSearch";
import ProjectList from "../components/ProjectList";
import UserProfile from "../components/UserProfile";
import BidGenerator from "../components/BidGenerator";
import PlaceBid from "../components/PlaceBid";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FLASK;
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [generatedBid, setGeneratedBid] = useState("");
  const [loading, setLoading] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("freelancerUser"));

  useEffect(() => {
    if (autoRefreshEnabled && lastSearchQuery && !loading) {
      const interval = setInterval(() => {
        handleSearch(lastSearchQuery, true);
      }, 40000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshEnabled, lastSearchQuery, loading]);

  const handleSearch = async (searchData, isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setLoading(true);
      setSelectedProject(null);
      setGeneratedBid("");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/search`, searchData);
      setProjects(response.data);
      if (!isAutoRefresh) {
        setLastSearchQuery(searchData);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Failed to fetch projects. Please try again.");
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  const handleIdSearch = async (searchData) => {
    setLoading(true);
    setAutoRefreshEnabled(false);
    setSelectedProject(null);
    setGeneratedBid("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/search_with_id`,
        searchData
      );
      const responseData = response.data;
      setProjects(responseData.projects || []);

      return {
        projects: responseData.projects || [],
        start_id: responseData.start_id,
        end_id: responseData.end_id,
        last_checked_id: responseData.last_checked_id,
        total_found: responseData.total_found,
        checked_ids: responseData.checked_ids || [],
        direction: responseData.direction || "forward",
      };
    } catch (error) {
      console.error("ID search error:", error);
      setProjects([]);
      const errorData = error.response?.data || {};
      throw {
        response: {
          data: {
            error: errorData.error || "No projects found in this ID range",
            checked_ids: errorData.checked_ids || [],
            last_checked_id: errorData.last_checked_id,
          },
        },
      };
    } finally {
      setLoading(false);
    }
  };

  const handleSingleProjectSearch = async (projectId) => {
    setLoading(true);
    setAutoRefreshEnabled(false);
    setSelectedProject(null);
    setGeneratedBid("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/search_single_project`,
        { project_id: projectId }
      );
      const project = response.data.project;
      setProjects([project]);

      return {
        success: true,
        project: project,
        message: `Found project ${projectId}`,
      };
    } catch (error) {
      console.error("Single project search error:", error);
      setProjects([]);
      const errorMsg = error.response?.data?.error || "Project not found";
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBid = async (isGraphics = false) => {
    if (!selectedProject) {
      alert("Please select a project first.");
      return;
    }

    setBidLoading(true);
    const endpoint = isGraphics ? "/generate_graphics" : "/generate";

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        project: selectedProject,
        userDetails: userDetails,
      });
      setGeneratedBid(response.data.bid);
    } catch (error) {
      console.error("Generate bid error:", error);
      alert("Failed to generate bid. Please try again.");
    } finally {
      setBidLoading(false);
    }
  };

  const handlePlaceBid = async (bidData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/place_bid`, {
        project_id: selectedProject.id,
        bid: generatedBid,
        amount: bidData.amount,
        period: bidData.period,
        project_title: selectedProject.title,
        project_url: generateProjectUrl(selectedProject),
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error("Already bid on this project");
      }
      throw error;
    }
  };

  const generateProjectUrl = (project) => {
    if (project.seo_url) {
      const cleanPath = project.seo_url.startsWith("/")
        ? project.seo_url.slice(1)
        : project.seo_url;
      return `https://www.freelancer.com/projects/${cleanPath}/details`;
    }
    return `https://www.freelancer.com/projects/${project.id}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Freelancer AI Assistant
                </h1>
                <p className="text-sm text-gray-600">
                  Smart bidding powered by AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
              </div>
              <button
                onClick={() => navigate("/bid-insight")}
                className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                📊 Insights
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                👤 Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <ProjectSearch
            onSearch={handleSearch}
            onIdSearch={handleIdSearch}
            onSingleProjectSearch={handleSingleProjectSearch}
            autoRefreshEnabled={autoRefreshEnabled}
            setAutoRefreshEnabled={setAutoRefreshEnabled}
          />

          <ProjectList
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            loading={loading}
            autoRefreshEnabled={autoRefreshEnabled}
          />

          <UserProfile
            userDetails={userDetails}
            onUpdateDetails={setUserDetails}
          />

          <BidGenerator
            selectedProject={selectedProject}
            generatedBid={generatedBid}
            onGenerateBid={handleGenerateBid}
            onBidChange={setGeneratedBid}
            loading={bidLoading}
          />

          {generatedBid && selectedProject && (
            <PlaceBid
              selectedProject={selectedProject}
              generatedBid={generatedBid}
              onPlaceBid={handlePlaceBid}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
