import { type Project } from "./types";

type ProjectDetailsProps = {
  project: Project;
};

export function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <section className="flex-1 rounded-3xl bg-white/70 backdrop-blur-lg overflow-hidden border border-blue-200/50 flex flex-col md:flex-row gap-8 p-8 mb-6 min-h-0 shadow-lg">
      <img
        src={project.image_url}
        alt={project.name}
        className="w-full md:w-1/3 h-auto object-cover rounded-2xl shadow-md"
      />
      <div className="overflow-y-auto custom-scrollbar flex-1">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          {project.name}
        </h2>
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">
          {project.description}
        </p>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          Visit Project →
        </a>
      </div>
    </section>
  );
}
