import { useState } from "react";

function UserProfile({ userDetails, onUpdateDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field, value) => {
    onUpdateDetails({
      ...userDetails,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hidden">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Step 2: Your Profile & Experience (Optional but Recommended)
      </h2>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          isExpanded
            ? "bg-blue-500 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {isExpanded
          ? "Hide Profile Details"
          : "Add Your Details for Better Bids"}
      </button>

      {isExpanded && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userDetails.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <small className="text-xs text-gray-600">
                How you want to be addressed in the bid
              </small>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Title
              </label>
              <input
                type="text"
                value={userDetails.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Full Stack Developer"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <small className="text-xs text-gray-600">
                e.g., Web Developer, Designer, Data Analyst
              </small>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={userDetails.yearsExperience || ""}
                onChange={(e) =>
                  handleInputChange("yearsExperience", e.target.value)
                }
                placeholder="5"
                min="0"
                max="50"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <small className="text-xs text-gray-600">
                Your total years in this field
              </small>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Hourly Rate ($)
              </label>
              <input
                type="number"
                value={userDetails.hourlyRate || ""}
                onChange={(e) =>
                  handleInputChange("hourlyRate", e.target.value)
                }
                placeholder="25"
                min="5"
                max="500"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <small className="text-xs text-gray-600">
                Your standard hourly rate
              </small>
            </div>

            {/* Key Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Key Skills & Technologies
              </label>
              <input
                type="text"
                value={userDetails.keySkills || ""}
                onChange={(e) => handleInputChange("keySkills", e.target.value)}
                placeholder="Python, React, Node.js, MongoDB, AWS"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <small className="text-xs text-gray-600">
                Comma-separated list of your main skills
              </small>
            </div>

            {/* Recent Projects */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recent Similar Projects (Optional)
              </label>
              <textarea
                value={userDetails.recentProjects || ""}
                onChange={(e) =>
                  handleInputChange("recentProjects", e.target.value)
                }
                placeholder="Briefly describe 1-2 similar projects you've completed recently..."
                rows="3"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
              />
              <small className="text-xs text-gray-600">
                This helps demonstrate relevant experience
              </small>
            </div>

            {/* Unique Value */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What Makes You Different? (Optional)
              </label>
              <textarea
                value={userDetails.uniqueValue || ""}
                onChange={(e) =>
                  handleInputChange("uniqueValue", e.target.value)
                }
                placeholder="Fast delivery, 24/7 communication, money-back guarantee, etc."
                rows="3"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-y"
              />
              <small className="text-xs text-gray-600">
                Your unique selling points or guarantees
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
