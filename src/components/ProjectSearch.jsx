import { useState, useEffect, useRef } from "react";

const DEFAULT_QUERY =
  "logo design, website development, php, photoshop, wordpress, ios development, mobile app development, react native, wordpress plugin, java, python, banner design, seo, nodejs, shopify, reactjs, fullstack development, nodejs, web api, mongodb, flutter, frontend design kubernetes, figma";

function ProjectSearch({
  onSearch,
  onIdSearch,
  onSingleProjectSearch,
  autoRefreshEnabled,
  setAutoRefreshEnabled,
}) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [projectType, setProjectType] = useState("fixed");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minHourly, setMinHourly] = useState("");
  const [maxHourly, setMaxHourly] = useState("");
  const [limit, setLimit] = useState(10);
  const [projectId, setProjectId] = useState("");
  const [currentStartId, setCurrentStartId] = useState(null);
  const [lastCheckedId, setLastCheckedId] = useState(null);
  const [lastSearchDirection, setLastSearchDirection] = useState("forward");
  const [idSearchStatus, setIdSearchStatus] = useState("");
  const [idSearching, setIdSearching] = useState(false);

  // Cooldown state for batch search buttons
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef(null);

  // Track last search result count
  const [lastSearchResultCount, setLastSearchResultCount] = useState(20);

  useEffect(() => {
    handleSearchSubmit();
    // Cleanup timer on unmount
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Start cooldown timer
  const startCooldown = () => {
    setCooldownSeconds(59);

    // Clear any existing timer
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Check if batch buttons are disabled due to cooldown/loading
  const isBatchDisabled = idSearching || cooldownSeconds > 0;

  // Next button is disabled if:
  // 1. No last checked ID exists, OR
  // 2. Currently searching, OR
  // 3. Last search returned less than 20 projects (end reached), OR
  // 4. Cooldown is active
  const isNextDisabled =
    !lastCheckedId ||
    idSearching ||
    lastSearchResultCount < 20 ||
    cooldownSeconds > 0;

  // Previous button uses the standard batch disabled logic
  const isPrevDisabled =
    !lastCheckedId || lastCheckedId <= 1 || isBatchDisabled;

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    setAutoRefreshEnabled(true);
    onSearch({
      query: query.trim(),
      project_type: projectType,
      minPrice: minPrice ? parseInt(minPrice) : null,
      maxPrice: maxPrice ? parseInt(maxPrice) : null,
      minHourly: minHourly ? parseInt(minHourly) : null,
      maxHourly: maxHourly ? parseInt(maxHourly) : null,
      limit: parseInt(limit),
    });
  };

  const handleIdSearchAction = async (action) => {
    const inputValue = parseInt(projectId);
    if (!inputValue || inputValue < 1) {
      alert("Please enter a valid project ID (minimum 1)");
      return;
    }

    setAutoRefreshEnabled(false);
    let searchId = inputValue;
    let direction = "forward";

    if (action === "prev") {
      searchId =
        lastCheckedId !== null
          ? lastCheckedId - 1
          : Math.max(1, currentStartId - 1);
      searchId = Math.max(1, searchId);
      direction = "backward";
      setLastSearchDirection("backward");
    } else if (action === "next") {
      searchId =
        lastCheckedId !== null ? lastCheckedId + 1 : currentStartId + 1;
      direction = "forward";
      setLastSearchDirection("forward");
    } else {
      direction = "forward";
      setLastSearchDirection("forward");
    }

    setProjectId(searchId);
    setIdSearching(true);
    setIdSearchStatus("🔍 Fetching projects...");

    try {
      const result = await onIdSearch({ start_id: searchId, direction });
      setCurrentStartId(result.start_id);
      setLastCheckedId(result.last_checked_id);
      setLastSearchResultCount(result.total_found);

      setIdSearchStatus(
        `<strong class="text-green-600">✅ Found ${
          result.total_found
        } projects</strong> 
        <span class="text-gray-600">(ID range: ${result.start_id} - ${
          result.end_id
        })</span>
        <br><small class="text-gray-500">Checked ${
          result.checked_ids?.length || 0
        } IDs • Last: ${result.last_checked_id} • ${
          result.direction
        } • Auto-refresh: OFF</small>`
      );

      // Start cooldown after successful search
      startCooldown();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.last_checked_id !== undefined) {
        setLastCheckedId(errorData.last_checked_id);
      } else {
        setLastCheckedId(searchId);
      }
      setCurrentStartId(searchId);

      setIdSearchStatus(
        `<span class="text-red-600">❌ ${
          errorData?.error || "No projects found"
        }</span>
        <br><small class="text-gray-500">Searched from ID: ${searchId} (${direction}) • Last checked: ${
          errorData?.last_checked_id || searchId
        } • Auto-refresh: OFF</small>`
      );

      // Start cooldown even on error to prevent spam
      startCooldown();
    } finally {
      setIdSearching(false);
    }
  };

  const handleSingleSearch = async () => {
    const inputValue = parseInt(projectId);
    if (!inputValue || inputValue < 1) {
      alert("Please enter a valid project ID (minimum 1)");
      return;
    }

    setAutoRefreshEnabled(false);
    setIdSearching(true);
    setIdSearchStatus("🔍 Fetching single project...");

    try {
      const result = await onSingleProjectSearch(inputValue);
      setIdSearchStatus(
        `<strong class="text-green-600">✅ Found project ${inputValue}</strong>
        <br><small class="text-gray-600">${result.project.title}</small>`
      );
      setCurrentStartId(inputValue);
      setLastCheckedId(inputValue);
      setLastSearchResultCount(1);
    } catch (error) {
      setIdSearchStatus(
        `<span class="text-red-600">❌ ${
          error.message || "Project not found"
        }</span>
        <br><small class="text-gray-500">Project ID ${inputValue} does not exist or is not accessible</small>`
      );
      setLastSearchResultCount(0);
    } finally {
      setIdSearching(false);
    }
  };

  // Format cooldown display
  const formatCooldown = (seconds) => {
    return `${seconds}s`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Project Search</h2>
          <p className="text-sm text-gray-500">
            Find projects by ID or keywords
          </p>
        </div>

        {/* Cooldown Badge */}
        {cooldownSeconds > 0 && (
          <div className="ml-auto flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <svg
              className="w-4 h-4 animate-pulse"
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
            Cooldown: {formatCooldown(cooldownSeconds)}
          </div>
        )}
      </div>

      {/* ID Search Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSingleSearch()}
            placeholder="Enter Project ID (e.g., 123456)"
            min="1"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
          />

          <button
            onClick={handleSingleSearch}
            disabled={idSearching}
            className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {idSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Navigation Buttons with Cooldown */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleIdSearchAction("prev")}
            disabled={isPrevDisabled}
            className="flex-1 sm:flex-none bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {cooldownSeconds > 0
              ? `Previous (${cooldownSeconds}s)`
              : "Previous 20"}
          </button>

          <button
            onClick={() => handleIdSearchAction("ok")}
            disabled={isBatchDisabled}
            className="flex-1 sm:flex-none bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {idSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Loading...
              </>
            ) : cooldownSeconds > 0 ? (
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Wait {cooldownSeconds}s
              </>
            ) : (
              "Get 20 Projects"
            )}
          </button>

          <button
            onClick={() => handleIdSearchAction("next")}
            disabled={isNextDisabled || cooldownSeconds > 0}
            title={
              lastSearchResultCount < 20 && lastSearchResultCount > 0
                ? "No more projects available - last search returned less than 20 results"
                : cooldownSeconds > 0
                ? `Wait ${cooldownSeconds}s`
                : ""
            }
            className="flex-1 sm:flex-none bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cooldownSeconds > 0 ? (
              `Next (${cooldownSeconds}s)`
            ) : lastSearchResultCount < 20 && lastSearchResultCount > 0 ? (
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
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                End Reached
              </>
            ) : (
              <>
                Next 20
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Cooldown Progress Bar */}
        {cooldownSeconds > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(cooldownSeconds / 59) * 100}%` }}
            />
          </div>
        )}

        {/* Status Message */}
        {idSearchStatus && (
          <div
            className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
            dangerouslySetInnerHTML={{ __html: idSearchStatus }}
          />
        )}

        {/* Info Card */}
        <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 p-2 rounded-lg shrink-0">
              <svg
                className="w-5 h-5 text-white"
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
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-2">How it works</h4>
              <ul className="text-sm text-blue-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">
                    🔍 Search:
                  </span>
                  <span>
                    Fetch the exact project with entered ID (no cooldown)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0">
                    📋 Get 20:
                  </span>
                  <span>Search forward from entered ID (59s cooldown)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold shrink-0">
                    ⏮️ Previous:
                  </span>
                  <span>
                    Search backward from last checked ID (59s cooldown)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold shrink-0">
                    ⏭️ Next:
                  </span>
                  <span>Continue searching forward (59s cooldown)</span>
                </li>
              </ul>
              <p className="text-xs text-amber-700 mt-3 bg-amber-50 p-2 rounded-lg">
                ⚠️ <strong>Rate Limit Protection:</strong> Batch search buttons
                have a 59-second cooldown to prevent API rate limiting.
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info - Collapsible */}
        <details className="bg-gray-50 rounded-xl border border-gray-200">
          <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            🔧 Search Information
          </summary>
          <div className="px-4 py-3 text-xs font-mono space-y-1 text-gray-600 border-t border-gray-200">
            <div>
              <strong>Project ID Input:</strong> {projectId || "none"}
            </div>
            <div>
              <strong>Current Start ID:</strong> {currentStartId || "none"}
            </div>
            <div>
              <strong>Last Checked ID:</strong> {lastCheckedId || "none"}
            </div>
            <div>
              <strong>Direction:</strong> {lastSearchDirection}
            </div>
            <div>
              <strong>Cooldown:</strong> {cooldownSeconds}s remaining
            </div>
            {/* <div>
              <strong>Last Result Count:</strong> {lastSearchResultCount}{" "}
              projects
            </div> */}
            {/* <div>
              <strong>Next Button Status:</strong>{" "}
              {isNextDisabled ? "Disabled" : "Enabled"}
              {lastSearchResultCount < 20 && lastSearchResultCount > 0
                ? " (< 20 results)"
                : ""}
            </div> */}
            <div>
              <strong>Next will search from:</strong>{" "}
              {lastCheckedId ? lastCheckedId + 1 : "N/A"}
            </div>
            <div>
              <strong>Previous will search from:</strong>{" "}
              {lastCheckedId ? lastCheckedId - 1 : "N/A"}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default ProjectSearch;
