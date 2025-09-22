// src/components/Home/index.tsx

import { useContext } from "react";
import { Link } from "react-router-dom";
import { AdminContext } from "../../Contexts/admin_context";
import { useHomeData } from "./useHomeData";
import ProfileCard from "./ProfileCard";
import EducationCard from "./EducationCard";
import ExperienceCard from "./ExperienceCard";

export default function Home() {
  const { isAdmin } = useContext(AdminContext);
  const { profile, education, experience, setExperience } = useHomeData();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full items-start">
        <ProfileCard profile={profile} />
        <EducationCard education={education} />
        <ExperienceCard experience={experience} setExperience={setExperience} />

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

        {/* Admin Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full h-full">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Admin Status</h2>
          {isAdmin ? (
            <div className="flex flex-col items-center space-y-3 text-center">
              <span className="text-4xl">🛡️</span>
              <p className="text-green-700 font-bold">
                You are now in <span className="underline">Admin Mode</span>!
              </p>
              <p className="text-sm text-gray-600">
                Hello myself! If you are not, I will find you. I swear.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-center">
              <span className="text-4xl">🙅</span>
              <p className="text-red-600 font-bold">No admin rights for you!</p>
              <p className="text-sm text-gray-600">
                This is my personal website. I won't give you access to change a thing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}