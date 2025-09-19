import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../Contexts/admin_context";

type Profile = {
  id: number;
  name: string;
  email: string;
  github: string;
  linkedin: string;
  bio: string;
};

type Education = {
  id: number;
  school: string;
  degree: string;
  start_date: string;
  end_date: string;
  link: string;
  image_url: string;
};

type Experience = {
  id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  present: boolean;
  image_url: string;
  order_index: number;
};

export default function Home() {
  const { isAdmin } = useContext(AdminContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

  useEffect(() => {
    fetch("/api/home/profile-info")
      .then((r) => r.json())
      .then((d: Profile) => setProfile(d))
      .catch(() => setProfile(null));

    fetch("/api/home/education")
      .then((r) => r.json())
      .then((d: Education[]) => setEducation(d))
      .catch(() => setEducation([]));

    fetch("/api/home/experience")
      .then((r) => r.json())
      .then((d: Experience[]) => setExperience(d))
      .catch(() => setExperience([]));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 w-full items-start">
        {/* Profile Card */}
        {profile ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
            <img
              src="/image/profile-img.png"
              alt="Profile"
              className="w-48 h-64 rounded-lg mx-auto mb-4 shadow-md object-cover"
            />

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {profile.name}
            </h1>

            <p className="text-gray-600 mb-4">{profile.bio}</p>

            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Email:</span> {profile.email}
              </p>
              <p>
                <span className="font-semibold">GitHub:</span>{" "}
                <a
                  href={profile.github}
                  className="text-blue-600 hover:underline"
                >
                  Click
                </a>
              </p>
              <p>
                <span className="font-semibold">LinkedIn:</span>{" "}
                <a
                  href={profile.linkedin}
                  className="text-blue-600 hover:underline"
                >
                  Click
                </a>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-700">Loading...</p>
        )}

        {/* Education Card */}
        {education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Education
            </h2>
            <ul className="space-y-3">
              {education.map((edu) => (
                <li
                  key={edu.id}
                  className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer
                     transition-transform duration-200 ease-in-out transform
                     hover:scale-105 hover:shadow-xl
                     active:scale-105 active:shadow-xl
                     focus:scale-105 focus:shadow-xl"
                  onClick={() => window.open(edu.link, "_blank")}
                >
                  <img
                    src={edu.image_url}
                    alt={edu.school}
                    className="w-12 h-12 rounded-md object-cover shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {edu.school}
                    </p>
                    <p className="text-xs text-gray-600">{edu.degree}</p>
                    <p className="text-xs text-gray-500">
                      {edu.start_date} – {edu.end_date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Experience Card */}
        {experience.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Experience
            </h2>
            <ul className="space-y-3">
              {experience
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((exp, index) => {
                  const endDisplay = exp.present ? "Present" : exp.end_date;

                  return (
                    <li
                      key={exp.id}
                      draggable={isAdmin}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", index.toString());
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        const fromIndex = Number(
                          e.dataTransfer.getData("text/plain")
                        );
                        const toIndex = index;
                        if (fromIndex === toIndex) return;

                        const updated = [...experience].sort(
                          (a, b) => a.order_index - b.order_index
                        );

                        const [moved] = updated.splice(fromIndex, 1);
                        updated.splice(toIndex, 0, moved);

                        const newOrder = updated.map((item, idx) => ({
                          id: item.id,
                          order_index: idx,
                        }));

                        setExperience(
                          updated.map((item, idx) => ({
                            ...item,
                            order_index: idx,
                          }))
                        );

                        fetch("/api/home/experience/order", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(newOrder),
                          credentials: "include",
                        });
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer
                         transition-transform duration-200 ease-in-out transform
                         hover:scale-105 hover:shadow-xl
                         active:scale-105 active:shadow-xl
                         focus:scale-105 focus:shadow-xl
                         ${
                           isAdmin ? "border border-dashed border-gray-300" : ""
                         }`}
                    >
                      <img
                        src={exp.image_url}
                        alt={exp.company}
                        className="w-12 h-12 rounded-md object-cover shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {exp.company}
                        </p>
                        <p className="text-xs text-gray-600">{exp.position}</p>
                        <p className="text-xs text-gray-500">
                          {exp.start_date} – {endDisplay}
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}

        {/* Admin Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Admin Status
          </h2>
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
                This is my personal website. I won't give you access to change a
                thing.
              </p>
            </div>
          )}
        </div>

        {/* New Card... */}
      </div>
    </div>
  );
}
