import { useState } from "react";

function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
  loading,
  autoRefreshEnabled,
}) {
  const [expandedProject, setExpandedProject] = useState(null);

  const generateProjectUrl = (project) => {
    if (project.seo_url) {
      const cleanPath = project.seo_url.startsWith("/")
        ? project.seo_url.slice(1)
        : project.seo_url;
      return `https://www.freelancer.com/projects/${cleanPath}/details`;
    }
    return `https://www.freelancer.com/projects/${project.id}`;
  };

  const renderStars = (rating, reviewCount) => {
    const stars = [];
    const hasRating = rating > 0 && reviewCount > 0;
    const starColor = hasRating ? "#10b981" : "#d1d5db";

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className="text-xl transition-colors"
          style={{ color: i <= Math.floor(rating) ? starColor : "#e5e7eb" }}
        >
          ★
        </span>
      );
    }

    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="flex">{stars}</div>
        <span
          className={`font-bold text-sm ${
            hasRating ? "text-emerald-600" : "text-gray-400"
          }`}
        >
          {rating.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500">
          {hasRating ? `(${reviewCount} reviews)` : "(No reviews)"}
        </span>
      </div>
    );
  };

  const handleProjectClick = (project) => {
    if (selectedProject?.id === project.id) {
      onSelectProject(null);
      setExpandedProject(null);
    } else {
      onSelectProject(project);
      setExpandedProject(project.id);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium animate-pulse">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="bg-linear-to-br from-gray-100 to-gray-200 p-6 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or enter a different project ID
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Available Projects
            </h2>
            <p className="text-sm text-gray-500">
              {projects.length} project{projects.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-200">
          <div
            className={`w-2 h-2 rounded-full ${
              autoRefreshEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          ></div>
          <span className="text-xs font-medium text-gray-700">
            {autoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="max-h-[700px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {projects.map((project) => {
          const budget = project.budget;
          const currency = project.currency;
          const budgetText =
            budget && currency
              ? `${budget.minimum} - ${budget.maximum} ${currency.code}`
              : "Not specified";

          const isExpanded = expandedProject === project.id;
          const isSelected = selectedProject?.id === project.id;

          const description = isExpanded
            ? project.description ||
              project.preview_description ||
              "No description available"
            : project.preview_description?.substring(0, 200) + "..." ||
              "No description available";

          return (
            <div
              key={project.id}
              className={`group relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-linear-to-r from-blue-50 to-indigo-50 shadow-lg"
                  : "border-gray-200 hover:border-blue-300 bg-white hover:shadow-md"
              }`}
              onClick={() => handleProjectClick(project)}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-linear-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold">
                  ✓ SELECTED
                </div>
              )}

              <div className="flex gap-4">
                {/* Radio Button */}
                <div className="flex items-start pt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {/* Title and ID */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-mono text-xs">
                        ID: {project.id}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-medium text-xs">
                        💼 {project.bid_stats?.bid_count || 0} bids
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md font-medium text-xs">
                        🌍 {project.client?.country || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Client Rating */}
                  {renderStars(
                    project.client?.rating?.overall || 0,
                    project.client?.rating?.reviews || 0
                  )}

                  {/* Budget and Link */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Budget:</span>
                      <span className="font-bold text-lg bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {budgetText}
                      </span>
                    </div>
                    <a
                      href={generateProjectUrl(project)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      View on Freelancer
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Description */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}

export default ProjectList;
