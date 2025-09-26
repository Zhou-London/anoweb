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
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Profile */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-8">
            <ProfileCard profile={profile} />
          </aside>

          {/* Right: two groups side-by-side on lg */}
          <main className="flex-1 flex flex-col lg:flex-row gap-6 items-start">
            {/* ===== Group A (center): one card per row ===== */}
            <section className="flex-1 grid grid-cols-1 gap-4 content-start">
              <div className="w-full">
                <LatestPostCard post={latestPost} />
              </div>
              <div className="w-full">
                <EducationCard education={education} />
              </div>
              <div className="w-full">
                <ExperienceCard
                  experience={experience}
                  setExperience={setExperience}
                />
              </div>
            </section>

            {/* ===== Group B (right): Projects then Admin Status ===== */}
            <aside className="w-full lg:max-w-sm lg:basis-1/3 flex flex-col space-y-4">
              <Link
                to="/projects"
                className="block bg-white rounded-2xl shadow-lg p-6 w-full transition-transform duration-150 hover:scale-[1.01] hover:shadow-xl no-underline"
              >
                <div className="text-center flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Projects</h2>
                  <span className="text-3xl mb-1">🚀</span>
                  <p className="text-gray-600">Explore my portfolio of work and personal projects.</p>
                </div>
              </Link>

              <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
                  Admin Status
                </h2>
                {isAdmin ? (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl">🛡️</span>
                    <p className="text-green-700 font-bold">
                      You are now in <span className="underline">Admin Mode</span>!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl">🙅</span>
                    <p className="text-red-600 font-bold">No admin rights for you!</p>
                  </div>
                )}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
