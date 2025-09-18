import { useEffect, useState } from "react";

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
};

export default function Home() {
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
                     transition-transform transform hover:scale-105 hover:shadow-xl"
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
              {experience.map((exp) => {
                const endDisplay = exp.present ? "Present" : exp.end_date;
                return (
                  <li
                    key={exp.id}
                    className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer
                       transition-transform transform hover:scale-105 hover:shadow-xl"
                    onClick={() => {
                      console.log(`Clicked on ${exp.company}`);
                    }}
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

        {/* New Card... */}
      </div>
    </div>
  );
}
