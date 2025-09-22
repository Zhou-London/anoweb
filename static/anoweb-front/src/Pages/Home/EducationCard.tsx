// src/components/Home/EducationCard.tsx

import type { Education } from "./types";

type EducationCardProps = {
  education: Education[];
};

export default function EducationCard({ education }: EducationCardProps) {
  if (education.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:max-w-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Education</h2>
      <ul className="space-y-3">
        {education.map((edu) => (
          <li
            key={edu.id}
            className="flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl"
            onClick={() => window.open(edu.link, "_blank")}
          >
            <img
              src={edu.image_url}
              alt={edu.school}
              className="w-12 h-12 rounded-md object-cover shadow-sm"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{edu.school}</p>
              <p className="text-xs text-gray-600">{edu.degree}</p>
              <p className="text-xs text-gray-500">
                {edu.start_date} – {edu.end_date}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}