import { useState, useEffect } from "react";

function BidGenerator({
  selectedProject,
  generatedBid,
  onGenerateBid,
  onBidChange,
  loading,
}) {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(generatedBid.length);
  }, [generatedBid]);

  const getCharCountColor = () => {
    if (charCount > 1500) return "text-red-600";
    if (charCount > 1200) return "text-orange-500";
    return "text-emerald-600";
  };

  const getProgressPercentage = () => {
    return Math.min((charCount / 1500) * 100, 100);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="bg-linear-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">AI Bid Generator</h2>
          <p className="text-sm text-gray-500">
            Generate professional proposals in seconds
          </p>
        </div>
      </div>

      {/* Generate Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => onGenerateBid(false)}
          disabled={!selectedProject || loading}
          className="flex-1 min-w-[200px] bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            "Generate Standard Bid"
          )}
        </button>

        <button
          onClick={() => onGenerateBid(true)}
          disabled={!selectedProject || loading}
          className="flex-1 min-w-[200px] bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {loading ? "Generating..." : "Generate Graphics Bid"}
        </button>
      </div>

      {/* Bid Output Area */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-blue-300">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-semibold text-purple-700 mb-2 animate-pulse">
              AI is crafting your proposal
            </p>
            <p className="text-sm text-gray-600">
              This may take a few seconds...
            </p>
          </div>
        ) : generatedBid ? (
          <div className="space-y-4">
            {/* Textarea */}
            <div className="relative">
              <textarea
                value={generatedBid}
                onChange={(e) => onBidChange(e.target.value)}
                className="w-full min-h-[450px] p-6 border-2 border-blue-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-linear-to-br from-blue-50/50 to-indigo-50/50 font-mono text-sm leading-relaxed whitespace-pre-wrap shadow-inner transition-all"
                placeholder="Your generated bid will appear here..."
              />

              {/* Floating Edit Badge */}
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editable
              </div>
            </div>

            {/* Character Count and Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 text-blue-500"
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
                  <span className="font-medium">
                    You can edit the bid before placing it
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${getCharCountColor()}`}>
                    {charCount}
                  </span>
                  <span className="text-gray-400 text-sm">/</span>
                  <span className="text-gray-600 text-sm font-medium">
                    1500
                  </span>
                  {charCount > 1500 && (
                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                      Too long!
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    charCount > 1500
                      ? "bg-linear-to-r from-red-500 to-red-600"
                      : charCount > 1200
                      ? "bg-linear-to-r from-orange-400 to-orange-500"
                      : "bg-linear-to-r from-emerald-500 to-teal-600"
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-500 p-2 rounded-lg shrink-0">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 mb-1">Pro Tips</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>
                      ✓ Personalize the greeting with the client's name if
                      available
                    </li>
                    <li>
                      ✓ Keep it under 1500 characters for better readability
                    </li>
                    <li>✓ Highlight your unique value proposition</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="bg-linear-to-br from-gray-200 to-gray-300 p-6 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-gray-500"
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Ready to generate your bid
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {selectedProject
                ? "Click one of the generate buttons above to create your AI-powered proposal"
                : "Select a project from the list above to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BidGenerator;
