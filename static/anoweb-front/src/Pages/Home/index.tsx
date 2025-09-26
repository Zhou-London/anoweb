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
  const { profile, education, experience, setExperience, latestPost } =
    useHomeData();

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="max-w-6xl mx-auto">
        {/* One row, three columns; all columns stretch to the tallest */}
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)_380px] items-stretch">
          {/* ===== Column 1 (equal height) ===== */}
          <div className="flex flex-col h-full gap-4">
            <div>
              <ProfileCard profile={profile} />
            </div>
            {/* Push the tiles to the bottom so this column matches others */}
            <div className="flex-1" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Admin left, Latest right */}
              <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  Admin Status
                </h2>
                {isAdmin ? (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl">🛡️</span>
                    <p className="text-green-700 font-bold">
                      You are now in{" "}
                      <span className="underline">Admin Mode</span>!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl">🙅</span>
                    <p className="text-red-600 font-bold">
                      No admin rights for you!
                    </p>
                  </div>
                )}
              </div>

              <LatestPostCard post={latestPost} size="compact" />
            </div>

          </div>
          {/* ===== Column 2 (equal height) ===== */}
          <div className="flex flex-col h-full gap-3">
            {/* Education ~40% */}
            <div className="basis-0 flex-[2] flex [&>*]:h-full">
              <EducationCard education={education} />
            </div>

            {/* Experience ~60% */}
            <div className="basis-0 flex-[3] flex [&>*]:h-full">
              <ExperienceCard
                experience={experience}
                setExperience={setExperience}
              />
            </div>
          </div>

          {/* ===== Column 3 (equal height) ===== */}
          <div className="flex flex-col h-full">
            <Link
              to="/projects"
              className="bg-white rounded-2xl shadow-lg p-6 w-full h-full transition-transform duration-150 hover:scale-[1.01] hover:shadow-xl no-underline flex"
            >
              <div className="m-auto text-center flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Projects
                </h2>
                <span className="text-4xl mb-2">🚀</span>
                <p className="text-gray-600 max-w-[22ch]">
                  Explore my portfolio of work and personal projects.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
