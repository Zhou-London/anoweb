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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Welcome</p>
          <h1 className="text-3xl font-semibold text-slate-900">Home</h1>
        </div>
        <span className="rounded-full bg-blue-50 text-blue-700 px-4 py-2 text-sm font-medium">Google-inspired layout</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_340px] items-stretch">
        <div className="flex flex-col h-full gap-4">
          <ProfileCard profile={profile} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full">
              <h2 className="text-lg font-semibold text-slate-900 mb-2 text-center">Admin Status</h2>
              {isAdmin ? (
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-3xl">🛡️</span>
                  <p className="text-emerald-700 font-semibold">You are now in Admin Mode!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-3xl">🙅</span>
                  <p className="text-rose-600 font-semibold">No admin rights for you!</p>
                </div>
              )}
            </div>

            <LatestPostCard post={latestPost} size="compact" />
          </div>
        </div>

        <div className="flex flex-col h-full gap-3">
          <div className="basis-0 flex-[2] flex [&>*]:h-full">
            <EducationCard education={education} />
          </div>

          <div className="basis-0 flex-[3] flex [&>*]:h-full">
            <ExperienceCard experience={experience} setExperience={setExperience} />
          </div>
        </div>

        <div className="flex flex-col h-full gap-4">
          <Link
            to="/projects"
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full transition-transform duration-150 hover:scale-[1.01] hover:shadow-md no-underline flex flex-1"
          >
            <div className="m-auto text-center flex flex-col items-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Projects</h2>
              <span className="text-4xl mb-2">🚀</span>
              <p className="text-slate-600 max-w-[22ch]">Explore my portfolio of work and personal projects.</p>
            </div>
          </Link>

          <a
            href="https://drive.google.com/file/d/1lJQSIysTrcrDtCgAK0koo-gIb0rhaJAK/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 w-full transition-transform duration-150 hover:scale-[1.01] hover:shadow-md no-underline flex"
          >
            <div className="m-auto text-center flex flex-col items-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">View My CV</h2>
              <span className="text-4xl mb-2">📄</span>
              <p className="text-slate-600 max-w-[24ch]">Download my resume to explore my experience and skills in depth.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
