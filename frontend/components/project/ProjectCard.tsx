'use client';
import React from 'react';
import { Edit, Star } from 'lucide-react';
interface ProjectCardProps {
  project: {
    id: number;
    name: string;
    description: string;
    image: string;
    hackathon: string;
    tags: string[];
    status: string;
    daysLeft: string;
    teamLeader: string;
  };
  onClick: () => void;
}
export function ProjectCard({
  project,
  onClick
}: ProjectCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/project-edit/${project.id}`;
  };
  return <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col md:flex-row" onClick={onClick}>
      <div className="w-full md:w-64 h-48 md:h-auto flex-shrink-0">
        <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{project.name}</h2>
              <span className={`text-xs px-2 py-1 rounded-full ${project.status === 'Live' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                {project.status}
              </span>
              <span className="text-xs text-gray-500">{project.daysLeft}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{project.hackathon}</p>
          </div>
          <button onClick={handleEditClick} className="p-2 rounded-full hover:bg-gray-100">
            <Edit size={18} className="text-gray-500" />
          </button>
        </div>
        <p className="text-gray-700 mb-4 line-clamp-2">{project.description}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {project.tags.map((tag, index) => <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {tag}
            </span>)}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="text-xs font-medium">
              {project.teamLeader.charAt(0)}
            </span>
          </div>
          <span className="text-sm text-gray-600">{project.teamLeader}</span>
        </div>
      </div>
    </div>;
}