import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ProfileSelector from "./ProfileSelector";

function PlaceBid({ selectedProject, generatedBid }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [amount, setAmount] = useState(50);
  const [period, setPeriod] = useState(7);
  const [milestonePercentage, setMilestonePercentage] = useState(100);
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

    if (!token || !email) return null;

    try {
      const decoded = jwtDecode(token);
      return {
        user_id: decoded.id,
        user_email: email,
        role: decoded.role || "user",
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { user_id: null, user_email: email, role: "user" };
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
    // Validation
    if (!amount || amount < 5) {
      setStatus({
        type: "error",
        message: "Please enter a valid bid amount (minimum $5)",
      });
      return;
    }
    if (!period || period < 1) {
      setStatus({
        type: "error",
        message: "Please enter a valid delivery time (minimum 1 day)",
      });
      return;
    }
    if (!selectedProfile) {
      setStatus({
        type: "error",
        message: "Please select a profile before placing the bid",
      });
      return;
    }
    if (!generatedBid || generatedBid.trim().length < 50) {
      setStatus({
        type: "error",
        message: "Please generate a bid proposal first",
      });
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

    // Build request payload
    const payload = {
      project_id: selectedProject.id,
      bid: generatedBid,
      amount: amount,
      period: period,
      milestone_percentage: milestonePercentage,
      project_title: selectedProject.title,
      project_url: generateProjectUrl(selectedProject),
      user_id: userInfo.user_id,
      user_email: userInfo.user_email,
      role: userInfo.role,
      profile_id: selectedProfile.id,
      profile_name: selectedProfile.name,
    };

    console.log("Submitting bid with payload:", payload);

    try {
      const response = await axios.post(`${API_BASE_URL}/place_bid`, payload);
      console.log("Bid response:", response.data);

      setStatus({
        type: "success",
        message: response.data.message || "✅ Bid placed successfully!",
      });

      setTimeout(() => {
        setIsExpanded(false);
        setStatus(null);
      }, 4000);
    } catch (error) {
      console.error("Place bid error:", error);

      let errorMessage = "Failed to place bid. Please try again.";
      let retryAfter = null;

      if (error.response) {
        const { status: httpStatus, data } = error.response;

        if (httpStatus === 429) {
          retryAfter = data.retry_after || 30;
          errorMessage = `⏳ Rate limit reached. Please wait ${retryAfter} seconds before trying again.`;
        } else if (httpStatus === 409) {
          errorMessage = "You have already bid on this project";
        } else if (httpStatus === 400) {
          errorMessage =
            typeof data.error === "string"
              ? data.error
              : data.message || "Invalid request.";
        } else if (httpStatus === 504) {
          errorMessage = "Request timed out. Please try again.";
        } else {
          errorMessage =
            typeof data.error === "string"
              ? data.error
              : data.message || errorMessage;
        }

        console.log("Error details:", data);
      }

      // Safe message, always a string now
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
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
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
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
                Configure bid details and select profile
              </p>
            </div>
          </div>
          {selectedProfile && (
            <div className="text-right">
              <span className="text-xs text-gray-500">Using Profile</span>
              <div className="text-sm font-semibold text-blue-600">
                {selectedProfile.name}
              </div>
            </div>
          )}
        </div>

        {/* Profile Selection */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
          <ProfileSelector
            selectedProfile={selectedProfile}
            onProfileSelect={setSelectedProfile}
          />
        </div>

        {/* Bid Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Amount */}
          <div className="bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
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
              <label className="font-bold text-gray-900 text-sm">
                Bid Amount
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                min="5"
                max="50000"
                className="w-full pl-7 pr-3 py-2 border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-lg font-bold"
              />
            </div>
          </div>

          {/* Period */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
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
              <label className="font-bold text-gray-900 text-sm">
                Delivery (days)
              </label>
            </div>
            <input
              type="number"
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value) || 1)}
              min="1"
              max="365"
              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-lg font-bold"
            />
          </div>

          {/* Milestone */}
          <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <label className="font-bold text-gray-900 text-sm">
                Milestone %
              </label>
            </div>
            <input
              type="number"
              value={milestonePercentage}
              onChange={(e) =>
                setMilestonePercentage(parseInt(e.target.value) || 100)
              }
              min="10"
              max="100"
              step="10"
              className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none text-lg font-bold"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-gray-500">Amount</div>
              <div className="font-bold text-lg text-emerald-600">
                ${amount}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Delivery</div>
              <div className="font-bold text-lg text-purple-600">
                {period} days
              </div>
            </div>
            <div>
              <div className="text-gray-500">Milestone</div>
              <div className="font-bold text-lg text-amber-600">
                {milestonePercentage}%
              </div>
            </div>
            <div>
              <div className="text-gray-500">Profile</div>
              <div className="font-bold text-lg text-blue-600 truncate">
                {selectedProfile?.name || "-"}
              </div>
            </div>
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
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
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
                Submit Bid
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsExpanded(false);
              setStatus(null);
            }}
            disabled={loading}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all flex items-center gap-2"
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
            className={`p-4 rounded-xl font-semibold flex items-center gap-3 ${
              status.type === "success"
                ? "bg-green-100 text-green-800 border-2 border-green-300"
                : status.type === "warning"
                ? "bg-amber-100 text-amber-800 border-2 border-amber-300"
                : status.type === "info"
                ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                : "bg-red-100 text-red-800 border-2 border-red-300"
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
    </div>
  );
}

export default PlaceBid;
