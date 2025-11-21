import { useState, useEffect } from "react";
import { Briefcase, ChevronDown, Check, Loader2 } from "lucide-react";
import axios from "axios";

function ProfileSelector({ selectedProfile, onProfileSelect }) {
  const [profiles, setProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FLASK;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/profiles`);
      console.log("Profile API response:", response.data);

      if (response.data.success && response.data.profiles) {
        const profilesList = response.data.profiles;
        setProfiles(profilesList);

        // Auto-select first profile if none selected
        if (profilesList.length > 0 && !selectedProfile) {
          onProfileSelect(profilesList[0]);
        }

        console.log(
          `Loaded ${profilesList.length} profiles from ${response.data.source}`
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
      setError("Failed to load profiles");

      // Set default profiles as fallback
      const defaultProfiles = [
        { id: 0, name: "General", description: "General freelancing profile" },
        {
          id: 1,
          name: "SEO, Digital Marketing",
          description: "SEO and marketing services",
        },
        {
          id: 2,
          name: "Logo & Illustration",
          description: "Design and branding",
        },
        {
          id: 3,
          name: "Graphics & Print Media",
          description: "Print design services",
        },
        {
          id: 4,
          name: "PowerPoint & Presentation",
          description: "Presentation design",
        },
      ];
      setProfiles(defaultProfiles);

      if (!selectedProfile) {
        onProfileSelect(defaultProfiles[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (profile) => {
    console.log("Selected profile:", profile);
    onProfileSelect(profile);
    setIsOpen(false);
  };

  const getProfileIcon = (profileName) => {
    const name = profileName?.toLowerCase() || "";
    if (name.includes("seo") || name.includes("marketing")) return "📈";
    if (name.includes("logo") || name.includes("illustration")) return "🎨";
    if (name.includes("graphic") || name.includes("print")) return "🖼️";
    if (name.includes("powerpoint") || name.includes("presentation"))
      return "📊";
    return "💼";
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <Briefcase className="w-4 h-4 inline mr-2" />
        Select Profile for Bidding
        {profiles.length > 0 && (
          <span className="ml-2 text-xs font-normal text-green-600">
            ({profiles.length} available)
          </span>
        )}
      </label>

      <button
        type="button"
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl transition-all duration-200 ${
          loading
            ? "border-gray-200 cursor-wait"
            : isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-gray-300 hover:border-blue-400"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              selectedProfile ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <span className="text-xl">
                {getProfileIcon(selectedProfile?.name)}
              </span>
            )}
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">
              {loading
                ? "Loading profiles..."
                : selectedProfile?.name || "Select a profile"}
            </div>
            {selectedProfile?.description && !loading && (
              <div className="text-xs text-gray-500 truncate max-w-[250px]">
                {selectedProfile.description}
              </div>
            )}
            {selectedProfile?.id && !loading && (
              <div className="text-xs text-blue-500">
                Profile ID: {selectedProfile.id}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Error message */}
      {error && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <span>⚠️</span> {error} - using defaults
        </p>
      )}

      {/* Dropdown */}
      {isOpen && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleSelect(profile)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedProfile?.id === profile.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        selectedProfile?.id === profile.id
                          ? "bg-blue-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <span
                        className={`text-lg ${
                          selectedProfile?.id === profile.id
                            ? "grayscale-0"
                            : ""
                        }`}
                      >
                        {getProfileIcon(profile.name)}
                      </span>
                    </div>
                    <div className="text-left">
                      <div
                        className={`font-semibold ${
                          selectedProfile?.id === profile.id
                            ? "text-blue-600"
                            : "text-gray-900"
                        }`}
                      >
                        {profile.name}
                      </div>
                      {profile.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {profile.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        ID: {profile.id}
                        {profile.hourly_rate && ` • $${profile.hourly_rate}/hr`}
                      </div>
                    </div>
                  </div>
                  {selectedProfile?.id === profile.id && (
                    <Check className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No profiles available</p>
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Select the appropriate profile for this project type
      </p>
    </div>
  );
}

export default ProfileSelector;
