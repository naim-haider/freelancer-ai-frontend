import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ProfileSelector from "./ProfileSelector";

function PlaceBid({ selectedProject, generatedBid }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState(50);
  const [period, setPeriod] = useState(2);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FLASK;

  useEffect(() => {
    if (selectedProject?.bid_stats?.bid_avg) {
      const avgBid = Math.round(selectedProject.bid_stats.bid_avg / 10) * 10;
      setAmount(avgBid);
    }
  }, [selectedProject]);

  const getUserInfo = () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token || !email) {
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      return {
        user_id: decoded.id,
        user_email: email,
        role: decoded.role || "user",
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return {
        user_id: null,
        user_email: email,
        role: "user",
      };
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

  const handleSubmit = async () => {
    if (!amount || amount < 5) {
      alert("Please enter a valid bid amount (minimum $5)");
      return;
    }
    if (!period || period < 1) {
      alert("Please enter a valid delivery time (minimum 1 day)");
      return;
    }
    if (!selectedProfile) {
      alert("Please select a profile before placing the bid");
      return;
    }

    const userInfo = getUserInfo();

    if (!userInfo || !userInfo.user_email) {
      alert("Please login to place a bid");
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/place_bid`, {
        project_id: selectedProject.id,
        bid: generatedBid,
        amount: amount,
        period: period,
        project_title: selectedProject.title,
        project_url: generateProjectUrl(selectedProject),
        user_id: userInfo.user_id,
        user_email: userInfo.user_email,
        role: userInfo.role,
        profile_id: selectedProfile.id,
        profile_name: selectedProfile.name,
      });

      setStatus({
        type: "success",
        message: response.data.message || "✅ Bid placed successfully!",
      });

      setTimeout(() => {
        setIsExpanded(false);
        setStatus(null);
      }, 3000);
    } catch (error) {
      console.error("Place bid error:", error);

      let errorMessage = "Failed to place bid. Please try again.";

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = "You have already bid on this project";
        } else if (error.response.status === 400) {
          errorMessage =
            error.response.data.error ||
            error.response.data.message ||
            errorMessage;
        } else {
          errorMessage =
            error.response.data.message ||
            error.response.data.error ||
            errorMessage;
        }
      }

      setStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full sm:w-auto bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform"
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
          Place This Bid on Freelancer
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="bg-linear-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Place Your Bid
              </h3>
              <p className="text-sm text-gray-600">
                Configure your bid details before submitting
              </p>
            </div>
          </div>

          {/* Profile Selection */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <label className="font-bold text-gray-900">Select Profile</label>
            </div>
            <ProfileSelector
              selectedProfile={selectedProfile}
              onProfileSelect={setSelectedProfile}
            />
          </div>

          {/* Bid Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <label className="font-bold text-gray-900">Bid Amount</label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="50"
                  min="5"
                  max="10000"
                  className="w-full pl-8 pr-4 py-3 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-lg font-bold transition-all"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Your proposed project price
              </p>
            </div>

            {/* Period */}
            <div className="bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <label className="font-bold text-gray-900">Delivery Time</label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                  placeholder="7"
                  min="1"
                  max="365"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-lg font-bold transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  days
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                How many days to complete
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedProfile}
              className="flex-1 min-w-[200px] bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Submit Bid to Freelancer
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsExpanded(false);
                setStatus(null);
              }}
              disabled={loading}
              className="flex-1 min-w-[150px] bg-linear-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={`p-5 rounded-xl font-semibold flex items-center gap-3 animate-slideIn ${
                status.type === "success"
                  ? "bg-linear-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300"
                  : "bg-linear-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-300"
              }`}
            >
              {status.type === "success" ? (
                <svg
                  className="w-6 h-6 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {status.message}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default PlaceBid;
