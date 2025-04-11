import React from "react";
import { useZoraCoins } from "../hooks/useZoraCoins";

// Placeholder identifier - replace with dynamic logic if needed
const PROFILE_IDENTIFIER = "0xAa92E8266E9C6128e9241952aE405Dd0e3251b72";

const ZoraProfileDisplay: React.FC = () => {
  const { getProfile } = useZoraCoins();
  const {
    data: profileResponse,
    isLoading,
    error,
  } = getProfile(PROFILE_IDENTIFIER);

  console.log("profileResponse", profileResponse);
  const profile = profileResponse?.data?.profile; // Navigate the nested structure

  if (isLoading) {
    return (
      <div className="p-4 border rounded shadow-sm mb-4 bg-gray-50">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded shadow-sm mb-4 bg-red-100 text-red-700">
        Error loading profile: {error.message}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 border rounded shadow-sm mb-4 bg-yellow-100 text-yellow-700">
        Profile not found for {PROFILE_IDENTIFIER}.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded shadow-sm mb-4 bg-white flex items-center space-x-4">
      {profile.avatar && (
        <img
          src={profile.avatar.medium}
          alt={`${profile.displayName || "Profile"} avatar`}
          className="w-16 h-16 rounded-full border"
        />
      )}
      <div className="flex flex-col text-black">
        {profile.handle ?? "No handle"}
        <h2 className="text-xl font-semibold">
          {profile.displayName || "Unnamed Profile"}
        </h2>
        {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
      </div>
    </div>
  );
};

export default ZoraProfileDisplay;
