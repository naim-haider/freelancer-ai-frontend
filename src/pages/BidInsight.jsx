import { useState, useEffect } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  MessageSquare,
  Award,
  Clock,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

function BidInsight() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FLASK;
  const [trackerData, setTrackerData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [expandedDates, setExpandedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token || !email) {
      window.location.href = "/login";
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserInfo({
        user_id: decoded.id,
        email: email,
        role: decoded.role || "user",
      });
    } catch (error) {
      console.error("Error decoding token:", error);
      setUserInfo({
        user_id: email,
        email: email,
        username: email.split("@")[0],
        role: "user",
      });
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      fetchTrackerData();
    }
  }, [selectedYear, selectedMonth, userInfo]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setExpandedDates({ [today]: true });
  }, []);

  useEffect(() => {
    if (
      trackerData?.is_admin &&
      trackerData.users?.length > 0 &&
      !selectedUserId
    ) {
      setSelectedUserId(trackerData.users[0].user_id);
    }
  }, [trackerData]);

  const fetchTrackerData = async () => {
    if (!userInfo) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bids/tracker`, {
        params: {
          year: selectedYear,
          month: selectedMonth,
          user_id: userInfo.user_id,
          role: userInfo.role,
        },
      });
      setTrackerData(response.data);
    } catch (error) {
      console.error("Error fetching tracker data:", error);
      alert("Failed to fetch bid tracker data");
    } finally {
      setLoading(false);
    }
  };

  console.log(trackerData);

  const toggleDate = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const getTodayDate = () => new Date().toLocaleDateString("en-CA");
  console.log("today", getTodayDate());

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const getSelectedUserData = () => {
    if (!trackerData?.is_admin) return null;
    return trackerData.users?.find((u) => u.user_id === selectedUserId);
  };

  // Function to update bid status in local state
  const updateLocalBidStatus = (bidId, newStatus, dateKey) => {
    setTrackerData((prevData) => {
      if (!prevData) return prevData;

      const newData = { ...prevData };

      if (prevData.is_admin) {
        newData.users = newData.users.map((user) => {
          if (user.user_id === selectedUserId) {
            const updatedUser = { ...user };

            if (updatedUser.dates[dateKey]) {
              const updatedDate = { ...updatedUser.dates[dateKey] };

              updatedDate.bids = updatedDate.bids.map((bid) =>
                bid.id === bidId ? { ...bid, bid_status: newStatus } : bid
              );

              const statusCounts = {
                pending: 0,
                bid_seen: 0,
                response_received: 0,
                awarded: 0,
              };

              updatedDate.bids.forEach((bid) => {
                const status = bid.bid_status || "pending";
                if (statusCounts.hasOwnProperty(status)) {
                  statusCounts[status]++;
                }
              });

              updatedDate.status_counts = statusCounts;
              updatedUser.dates[dateKey] = updatedDate;
            }

            const totalStatusCounts = {
              pending: 0,
              bid_seen: 0,
              response_received: 0,
              awarded: 0,
            };

            Object.values(updatedUser.dates).forEach((date) => {
              Object.entries(date.status_counts || {}).forEach(
                ([status, count]) => {
                  if (totalStatusCounts.hasOwnProperty(status)) {
                    totalStatusCounts[status] += count;
                  }
                }
              );
            });

            updatedUser.status_counts = totalStatusCounts;
            return updatedUser;
          }
          return user;
        });
      } else {
        // User view: Update in dates
        if (newData.dates && newData.dates[dateKey]) {
          const updatedDate = { ...newData.dates[dateKey] };

          // Update bid status in bids array
          updatedDate.bids = updatedDate.bids.map((bid) =>
            bid.id === bidId ? { ...bid, bid_status: newStatus } : bid
          );

          // Recalculate status counts for this date
          const statusCounts = {
            pending: 0,
            bid_seen: 0,
            response_received: 0,
            awarded: 0,
          };

          updatedDate.bids.forEach((bid) => {
            const status = bid.bid_status || "pending";
            if (statusCounts.hasOwnProperty(status)) {
              statusCounts[status]++;
            }
          });

          updatedDate.status_counts = statusCounts;
          newData.dates[dateKey] = updatedDate;

          // Recalculate month totals
          if (newData.month_totals) {
            const monthStatusCounts = {
              pending: 0,
              bid_seen: 0,
              response_received: 0,
              awarded: 0,
            };

            Object.values(newData.dates).forEach((date) => {
              Object.entries(date.status_counts || {}).forEach(
                ([status, count]) => {
                  if (monthStatusCounts.hasOwnProperty(status)) {
                    monthStatusCounts[status] += count;
                  }
                }
              );
            });

            newData.month_totals.status_counts = monthStatusCounts;
          }
        }
      }

      return newData;
    });
  };

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (loading && !trackerData) {
    return (
      <div className="flex justify-center items-center h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  const selectedUserData = getSelectedUserData();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {trackerData?.is_admin ? "Admin Dashboard" : "My Bid Tracker"}
                </h1>
                <p className="text-gray-600 mt-1">
                  Track bidding activity and monitor performance
                </p>
              </div>
            </div>
            {userInfo.role === "admin" && (
              <div className="px-4 py-2 bg-linear-to-r from-purple-100 to-pink-100 text-purple-800 rounded-xl font-semibold border-2 border-purple-200 shadow-md">
                <Users className="w-4 h-4 inline mr-2" />
                Admin View
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent focus:outline-none font-semibold text-gray-700 cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            <button
              onClick={fetchTrackerData}
              disabled={loading}
              className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {trackerData?.is_admin && selectedUserData ? (
          <AdminStatsCards userData={selectedUserData} />
        ) : !trackerData?.is_admin && trackerData?.month_totals ? (
          <UserStatsCards monthTotals={trackerData.month_totals} />
        ) : null}

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {trackerData?.is_admin ? (
            <div>
              {/* User Tabs */}
              <div className="border-b border-gray-200 bg-linear-to-br from-gray-50 to-gray-100">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {trackerData.users && trackerData.users.length > 0 ? (
                    trackerData.users.map((userData) => (
                      <button
                        key={userData.user_id}
                        onClick={() => {
                          setSelectedUserId(userData.user_id);
                          setExpandedDates({});
                        }}
                        className={`shrink-0 px-6 py-4 font-semibold transition-all border-b-4 ${
                          selectedUserId === userData.user_id
                            ? "border-blue-600 bg-white text-blue-600 shadow-lg"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                              selectedUserId === userData.user_id
                                ? "bg-linear-to-br from-blue-500 to-indigo-600 text-white"
                                : "bg-gray-300 text-gray-600"
                            }`}
                          >
                            {userData.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{userData.username}</div>
                            <div className="text-xs opacity-75">
                              {userData.total_bids} bids
                              {/* · $
                              {userData.total_amount.toFixed(0)} */}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="w-full text-center py-8 text-gray-500">
                      No users found for this month
                    </div>
                  )}
                </div>
              </div>

              {/* Selected User's Dates */}
              <div className="p-6">
                {selectedUserData ? (
                  <DatesList
                    dates={Object.values(selectedUserData.dates)}
                    expandedDates={expandedDates}
                    toggleDate={toggleDate}
                    formatDate={formatDate}
                    getTodayDate={getTodayDate}
                    updateLocalBidStatus={updateLocalBidStatus}
                  />
                ) : (
                  <EmptyState message="Select a user to view their bids" />
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {trackerData?.dates &&
              Object.keys(trackerData.dates).length > 0 ? (
                <DatesList
                  dates={Object.values(trackerData.dates)}
                  expandedDates={expandedDates}
                  toggleDate={toggleDate}
                  formatDate={formatDate}
                  getTodayDate={getTodayDate}
                  updateLocalBidStatus={updateLocalBidStatus}
                />
              ) : (
                <EmptyState message="No bids found for this month. Start bidding to see your activity here!" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin Stats Cards Component
function AdminStatsCards({ userData }) {
  const statusConfig = {
    pending: { icon: Clock, color: "blue", label: "Pending" },
    bid_seen: { icon: Eye, color: "purple", label: "Bid Seen" },
    response_received: {
      icon: MessageSquare,
      color: "orange",
      label: "Response Received",
    },
    awarded: { icon: Award, color: "green", label: "Awarded" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Object.entries(statusConfig).map(([key, config]) => {
        const Icon = config.icon;
        const count = userData.status_counts?.[key] || 0;

        return (
          <div
            key={key}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {config.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
              <div className={`p-3 bg-${config.color}-100 rounded-xl`}>
                <Icon className={`w-6 h-6 text-${config.color}-600`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// User Stats Cards Component
function UserStatsCards({ monthTotals }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      label: "Pending",
    },
    bid_seen: {
      icon: Eye,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      label: "Bid Seen",
    },
    response_received: {
      icon: MessageSquare,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      textColor: "text-orange-600",
      label: "Response Received",
    },
    awarded: {
      icon: Award,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      textColor: "text-green-600",
      label: "Awarded",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Object.entries(statusConfig).map(([key, config]) => {
        const Icon = config.icon;
        const count = monthTotals.status_counts?.[key] || 0;

        return (
          <div
            key={key}
            className={`bg-linear-to-br ${config.bgColor} rounded-xl shadow-lg border-2 border-gray-200 p-5 hover:shadow-xl transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 text-sm font-bold">
                  {config.label}
                </p>
                <p className={`text-3xl font-bold ${config.textColor} mt-1`}>
                  {count}
                </p>
              </div>
              <div
                className={`p-3 bg-linear-to-br ${config.color} rounded-xl shadow-md`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Empty State Component
function EmptyState({ message }) {
  return (
    <div className="text-center py-16">
      <div className="bg-linear-to-br from-gray-100 to-gray-200 p-8 rounded-full inline-block mb-4">
        <Calendar className="w-16 h-16 text-gray-400" />
      </div>
      <p className="text-lg font-semibold text-gray-900 mb-2">No Data Found</p>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

// Dates List Component
function DatesList({
  dates,
  expandedDates,
  toggleDate,
  formatDate,
  getTodayDate,
  updateLocalBidStatus,
}) {
  if (!dates || dates.length === 0) {
    return <EmptyState message="No bids for this period" />;
  }

  return (
    <div className="space-y-4">
      {dates.map((dateData) => (
        <DateCard
          key={dateData.date}
          dateData={dateData}
          isExpanded={expandedDates[dateData.date]}
          onToggle={() => toggleDate(dateData.date)}
          formatDate={formatDate}
          isToday={dateData.date === getTodayDate()}
          updateLocalBidStatus={updateLocalBidStatus}
        />
      ))}
    </div>
  );
}

// Date Card Component
function DateCard({
  dateData,
  isExpanded,
  onToggle,
  formatDate,
  isToday,
  updateLocalBidStatus,
}) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FLASK;
  const [updating, setUpdating] = useState(null);

  const updateBidStatus = async (bidId, newStatus) => {
    setUpdating(bidId);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/bids/update-status`, {
        bid_id: bidId,
        bid_status: newStatus,
      });

      if (res.data.success) {
        // Update local state immediately
        updateLocalBidStatus(bidId, newStatus, dateData.date);

        // Show success feedback (optional)
        console.log("✅ Status updated successfully");
      }

      return res.data;
    } catch (err) {
      console.error("Error updating bid status", err);
      alert("Failed to update bid status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: "bg-blue-100 text-blue-700 border-blue-200",
      bid_seen: "bg-purple-100 text-purple-700 border-purple-200",
      response_received: "bg-orange-100 text-orange-700 border-orange-200",
      awarded: "bg-green-100 text-green-700 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      bid_seen: <Eye className="w-4 h-4" />,
      response_received: <MessageSquare className="w-4 h-4" />,
      awarded: <Award className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const statusCounts = dateData.status_counts || {};

  return (
    <div
      className={`rounded-2xl  overflow-hidden transition-all duration-300 ${
        isToday
          ? "ring-4 ring-green-400 shadow-2xl"
          : isExpanded
          ? "ring-2 ring-blue-400 shadow-xl"
          : "shadow-md hover:shadow-lg"
      }`}
    >
      {/* Date Header */}
      <div
        className={`p-6 cursor-pointer transition-all ${
          isToday
            ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            : isExpanded
            ? "bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            : "bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900"
        }`}
        onClick={onToggle}
      >
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                isToday ? "bg-white/20" : "bg-white/10"
              } shadow-lg`}
            >
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {formatDate(dateData.date)}
                {isToday && " 🎯"}
              </h3>
              <p className="text-sm opacity-90 mt-1 font-medium">
                {dateData.date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm opacity-90 font-medium">Total Bids</p>
              <p className="text-3xl font-bold">{dateData.total_count}</p>
            </div>
            {/* <div className="text-right">
              <p className="text-sm opacity-90 font-medium">Total Amount</p>
              <p className="text-3xl font-bold">
                ${dateData.total_amount.toFixed(2)}
              </p>
            </div> */}
            {isExpanded ? (
              <ChevronUp className="w-8 h-8" />
            ) : (
              <ChevronDown className="w-8 h-8" />
            )}
          </div>
        </div>

        {/* Status Summary Pills */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {Object.entries(statusCounts).map(([status, count]) => {
            if (count === 0) return null;
            const statusLabels = {
              pending: "Pending",
              bid_seen: "Bid Seen",
              response_received: "Response Received",
              awarded: "Awarded",
            };
            return (
              <div
                key={status}
                className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/30"
              >
                {getStatusIcon(status)}
                <span className="font-semibold text-sm">
                  {statusLabels[status]}: {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bids List */}
      {isExpanded && (
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Bid Preview
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dateData.bids.map((bid, index) => (
                  <tr
                    key={bid.id}
                    className={`transition-colors hover:bg-blue-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {bid.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md line-clamp-2">
                        {bid.bid_text}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {bid.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-bold text-green-600">
                          {new Date(bid.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "UTC",
                            }
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={bid.bid_status || "pending"}
                          onChange={(e) =>
                            updateBidStatus(bid.id, e.target.value)
                          }
                          disabled={updating === bid.id}
                          className={`px-4 py-2 border-2 rounded-xl font-semibold text-sm transition-all hover:shadow-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getStatusBadgeColor(
                            bid.bid_status || "pending"
                          )}`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="bid_seen">👁️ Bid Seen</option>
                          <option value="response_received">
                            💬 Response Received
                          </option>
                          <option value="awarded">🏆 Awarded</option>
                        </select>
                        {updating === bid.id && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={bid.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        View Project
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BidInsight;
