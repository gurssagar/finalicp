import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FreelancerProfileLayout } from '../../components/FreelancerProfileLayout';
import { Plus, Edit2 } from 'lucide-react';
export function ProfileWorkList() {
  const navigate = useNavigate();
  const [workExperiences, setWorkExperiences] = useState([{
    id: '1',
    role: 'Frontend Web Developer',
    company: 'Levitating Elephant Technologies Pvt Ltd',
    startDate: 'June 2022',
    endDate: 'July 2023',
    description: 'Developed responsive web applications using React and TypeScript.'
  }]);
  const handleAddMoreExperience = () => {
    navigate('/profile/work');
  };
  const handleEditExperience = (id: string) => {
    navigate(`/profile/work?id=${id}`);
  };
  const handleContinue = () => {
    navigate('/profile/others');
  };
  return <FreelancerProfileLayout activeTab="work" progress="1/3" detailsType="Work">
      <div>
        <h2 className="text-xl font-semibold text-[#161616] mb-6">
          Work Experience Requirements
        </h2>
        <div className="space-y-6">
          {workExperiences.map(experience => <div key={experience.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{experience.role}</h3>
                  <button onClick={() => handleEditExperience(experience.id)} className="text-gray-500">
                    <Edit2 size={16} />
                  </button>
                </div>
                <p className="text-[#2ba24c]">{experience.company}</p>
                <p className="text-sm text-gray-500">
                  {experience.startDate} - {experience.endDate}
                </p>
              </div>
            </div>)}
          <button onClick={handleAddMoreExperience} className="flex items-center gap-2 text-blue-600 mt-4">
            <Plus size={16} className="text-blue-600" />
            ADD MORE EXPERIENCE
          </button>
        </div>
        <div className="flex justify-center pt-10">
          <button onClick={handleContinue} className="px-12 py-3 bg-[#0B1F36] text-white rounded-full font-medium hover:bg-[#1a3a5f] transition-colors">
            Next
          </button>
        </div>
      </div>
    </FreelancerProfileLayout>;
}