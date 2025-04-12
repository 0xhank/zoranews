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

  const profile = profileResponse?.success
    ? profileResponse.data?.profile
    : null; // Ensure success check

  if (isLoading) {
    return (
      // Consistent loading state styling
      <div className="p-4 border border-gray-200 rounded-lg shadow-sm mb-4 bg-gray-50 text-gray-500 text-sm">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      // Consistent error state styling
      <div className="p-4 border border-red-200 rounded-lg shadow-sm mb-4 bg-red-50 text-red-800 text-sm">
        <p className="font-medium">Error loading profile:</p>
        <p>{error.message || "An unknown error occurred."}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      // Consistent "not found" / empty state styling (using yellow)
      <div className="p-4 border border-yellow-200 rounded-lg shadow-sm mb-4 bg-yellow-50 text-yellow-800 text-sm">
        Profile not found for identifier: {PROFILE_IDENTIFIER}.
      </div>
    );
  }

  return (
    // Main profile card - slight adjustments for consistency
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm mb-4 bg-white flex items-center space-x-4">
      {profile.avatar && (
        <img
          // Use provided avatar or a fallback
          src={profile.avatar.medium || "./placeholder-avatar.png"} // Ensure you have a placeholder image if needed
          alt={`${profile.displayName || "Profile"} avatar`}
          className="w-12 h-12 rounded-full border border-gray-200 bg-gray-100" // Slightly smaller avatar, added bg color
          loading="lazy"
        />
      )}
      <div className="flex-grow">
        {/* Display name as primary heading */}
        <h2 className="text-base font-semibold text-gray-900">
          {profile.displayName || "Unnamed Profile"}
        </h2>
        {/* Handle as secondary info */}
        {profile.handle && (
          <p className="text-sm text-gray-500">@{profile.handle}</p>
        )}
        {/* Bio styling */}
        {profile.bio && (
          <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
        )}
      </div>
    </div>
  );
};

export default ZoraProfileDisplay;
