import { useState, useEffect } from "react";
import { Briefcase, ChevronDown, Check } from "lucide-react";
import axios from "axios";

function ProfileSelector({ selectedProfile, onProfileSelect }) {
  const [profiles, setProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_FLASK;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profiles`);
      console.log("profile res", response);

      const profilesList = response.data.profiles || [];
      setProfiles(profilesList);

      // Auto-select "General" profile if available
      const generalProfile = profilesList.find((p) => p.name === "General");
      if (generalProfile && !selectedProfile) {
        onProfileSelect(generalProfile);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
      // Set default profiles if API fails
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
      onProfileSelect(defaultProfiles[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (profile) => {
    onProfileSelect(profile);
    setIsOpen(false);
  };

  console.log(profiles);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <Briefcase className="w-4 h-4 inline mr-2" />
        Select a profile
        <span className="ml-2 text-xs font-normal text-blue-600 cursor-pointer hover:underline">
          NEW
        </span>
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
        disabled={loading}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">
              {loading
                ? "Loading profiles..."
                : selectedProfile?.name || "Select a profile"}
            </div>
            {selectedProfile?.description && (
              <div className="text-xs text-gray-500">
                {selectedProfile.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute z-20 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleSelect(profile)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors ${
                  selectedProfile?.id === profile.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedProfile?.id === profile.id
                        ? "bg-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    <Briefcase
                      className={`w-5 h-5 ${
                        selectedProfile?.id === profile.id
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    />
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
                      <div className="text-xs text-gray-500">
                        {profile.description}
                      </div>
                    )}
                  </div>
                </div>
                {selectedProfile?.id === profile.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}

            {profiles.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No profiles available</p>
                <p className="text-xs mt-1">Using default General profile</p>
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Select the appropriate profile for this project
      </p>
    </div>
  );
}

export default ProfileSelector;
