// src/components/Home/index.tsx

import { useContext } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../Contexts/admin_context";
import { useHomeData } from "./useHomeData";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";
import LatestPostCard from "./LatestPostCard";

export default function Home() {
  const { isAdmin } = useContext(AdminContext);
  const { profile, education, experience, setExperience, latestPost } = useHomeData();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">

        {/* Left Column: ProfileCard (no change) */}
        <div className="w-full lg:w-auto lg:max-w-sm shrink-0">
          <ProfileCard profile={profile} />
        </div>

        {/* Right Column: Now with two sub-columns */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Right Column's Left Sub-column: Education and Experience */}
          <div className="flex flex-col gap-6">
            <EducationCard education={education} />
            <ExperienceCard experience={experience} setExperience={setExperience} />
          </div>

          {/* Right Column's Right Sub-column: Projects, Latest Post, and Admin */}
          <div className="flex flex-col gap-6">
            {/* Projects Card */}
            <Link
              to="/projects"
              className="block bg-white rounded-2xl shadow-lg p-6 w-full h-full transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl no-underline"
            >
              <div className="text-center flex flex-col justify-center items-center h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Projects</h2>
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-2">🚀</span>
                  <p className="text-gray-600">
                    Explore my portfolio of work and personal projects.
                  </p>
                </div>
              </div>
            </Link>

            {/* Latest Post Card */}
            <LatestPostCard post={latestPost} />

            {/* Admin Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">Admin Status</h2>
              {isAdmin ? (
                <div className="flex flex-col items-center justify-center text-center flex-1 space-y-3">
                  <span className="text-4xl">🛡️</span>
                  <p className="text-green-700 font-bold">
                    You are now in <span className="underline">Admin Mode</span>!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center flex-1 space-y-3">
                  <span className="text-4xl">🙅</span>
                  <p className="text-red-600 font-bold">No admin rights for you!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}