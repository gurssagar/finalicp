"use client"
import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header1'
import { ChevronLeft, Save, Plus, X, Upload, Link } from 'lucide-react'
export default function SubmitHackathonProject() {
  const router = useRouter()
  const { hackathonId } = useParams<{
    hackathonId: string
  }>()
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    githubLink: '',
    demoLink: '',
    demoVideo: '',
    pitchVideo: '',
    projectImage: '',
    techStack: [''],
    tags: [''],
    teamMembers: [
      {
        name: '',
        role: 'Team Leader',
        location: '',
        bio: '',
        skills: [''],
      },
    ],
  })
  // Handle form field changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        projectImage: e.target.files[0].name,
      })
    }
  }
  // Tech stack handlers
  const handleTechStackChange = (index: number, value: string) => {
    const updatedTechStack = [...formData.techStack]
    updatedTechStack[index] = value
    setFormData({
      ...formData,
      techStack: updatedTechStack,
    })
  }
  const addTechStack = () => {
    setFormData({
      ...formData,
      techStack: [...formData.techStack, ''],
    })
  }
  const removeTechStack = (index: number) => {
    const updatedTechStack = formData.techStack.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      techStack: updatedTechStack,
    })
  }
  // Tags handlers
  const handleTagChange = (index: number, value: string) => {
    const updatedTags = [...formData.tags]
    updatedTags[index] = value
    setFormData({
      ...formData,
      tags: updatedTags,
    })
  }
  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, ''],
    })
  }
  const removeTag = (index: number) => {
    const updatedTags = formData.tags.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      tags: updatedTags,
    })
  }
  // Team member handlers
  const handleTeamMemberChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedTeamMembers = [...formData.teamMembers]
    updatedTeamMembers[index] = {
      ...updatedTeamMembers[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      teamMembers: updatedTeamMembers,
    })
  }
  const handleTeamMemberSkillChange = (
    memberIndex: number,
    skillIndex: number,
    value: string,
  ) => {
    const updatedTeamMembers = [...formData.teamMembers]
    const updatedSkills = [...updatedTeamMembers[memberIndex].skills]
    updatedSkills[skillIndex] = value
    updatedTeamMembers[memberIndex] = {
      ...updatedTeamMembers[memberIndex],
      skills: updatedSkills,
    }
    setFormData({
      ...formData,
      teamMembers: updatedTeamMembers,
    })
  }
  const addTeamMemberSkill = (memberIndex: number) => {
    const updatedTeamMembers = [...formData.teamMembers]
    updatedTeamMembers[memberIndex] = {
      ...updatedTeamMembers[memberIndex],
      skills: [...updatedTeamMembers[memberIndex].skills, ''],
    }
    setFormData({
      ...formData,
      teamMembers: updatedTeamMembers,
    })
  }
  const removeTeamMemberSkill = (memberIndex: number, skillIndex: number) => {
    const updatedTeamMembers = [...formData.teamMembers]
    const updatedSkills = updatedTeamMembers[memberIndex].skills.filter(
      (_, i) => i !== skillIndex,
    )
    updatedTeamMembers[memberIndex] = {
      ...updatedTeamMembers[memberIndex],
      skills: updatedSkills,
    }
    setFormData({
      ...formData,
      teamMembers: updatedTeamMembers,
    })
  }
  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [
        ...formData.teamMembers,
        {
          name: '',
          role: 'Team Member',
          location: '',
          bio: '',
          skills: [''],
        },
      ],
    })
  }
  const removeTeamMember = (index: number) => {
    const updatedTeamMembers = formData.teamMembers.filter(
      (_, i) => i !== index,
    )
    setFormData({
      ...formData,
      teamMembers: updatedTeamMembers,
    })
  }
  // Navigation handlers
  const handleBack = () => {
    router.push(`/hackathon-detail/${hackathonId}`)
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Here you would typically send the data to your API
    console.log('Submitting project:', formData)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/submitted-projects')
    }, 1500)
  }
  // Render different tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter your project name"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Short Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={150}
                placeholder="Brief description of your project (max 150 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear in project cards and search results
              </p>
            </div>
            <div>
              <label
                htmlFor="longDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Detailed Description *
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Provide a comprehensive description of your project, its purpose, features, and how it works"
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="githubLink"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                GitHub Repository URL *
              </label>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 p-2 rounded-l-lg border border-r-0 border-gray-300">
                  <Link size={18} className="text-gray-500" />
                </div>
                <input
                  type="url"
                  id="githubLink"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleInputChange}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username/repo"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="demoLink"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Demo URL (if available)
              </label>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 p-2 rounded-l-lg border border-r-0 border-gray-300">
                  <Link size={18} className="text-gray-500" />
                </div>
                <input
                  type="url"
                  id="demoLink"
                  name="demoLink"
                  value={formData.demoLink}
                  onChange={handleInputChange}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-demo-site.com"
                />
              </div>
            </div>
          </div>
        )
      case 'media':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Cover Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {formData.projectImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(formData.projectImage)}
                      alt="Project cover"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          projectImage: null,
                        })
                      }
                      className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-70 rounded-full text-white hover:bg-opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="projectImage" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-700">
                          Click to upload a cover image
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </span>
                        <input
                          id="projectImage"
                          name="projectImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById('projectImage')?.click()
                          }
                          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Upload Image
                        </button>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="demoVideo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Demo Video URL
              </label>
              <input
                type="url"
                id="demoVideo"
                name="demoVideo"
                value={formData.demoVideo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/embed/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                YouTube or Vimeo embed URL for your demo video
              </p>
            </div>
            <div>
              <label
                htmlFor="pitchVideo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pitch Video URL
              </label>
              <input
                type="url"
                id="pitchVideo"
                name="pitchVideo"
                value={formData.pitchVideo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/embed/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                YouTube or Vimeo embed URL for your pitch video
              </p>
            </div>
          </div>
        )
      case 'technical':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tech Stack *
              </label>
              <div className="space-y-2">
                {formData.techStack.map((tech, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) =>
                        handleTechStackChange(index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., React, Node.js, Solidity"
                      required={index === 0}
                    />
                    {formData.techStack.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTechStack(index)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTechStack}
                  className="flex items-center text-sm text-blue-500 hover:text-blue-600"
                >
                  <Plus size={16} className="mr-1" />
                  Add Technology
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags *
              </label>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., DeFi, SocialFi, AI"
                      required={index === 0}
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="flex items-center text-sm text-blue-500 hover:text-blue-600"
                >
                  <Plus size={16} className="mr-1" />
                  Add Tag
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tags help others discover your project and are used for
                hackathon categorization
              </p>
            </div>
          </div>
        )
      case 'team':
        return (
          <div className="space-y-8">
            {formData.teamMembers.map((member, memberIndex) => (
              <div
                key={memberIndex}
                className="border border-gray-200 rounded-lg p-6 relative"
              >
                {formData.teamMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(memberIndex)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
                <h3 className="text-lg font-medium mb-4">
                  {member.role === 'Team Leader'
                    ? 'Team Leader'
                    : `Team Member ${memberIndex}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        handleTeamMemberChange(
                          memberIndex,
                          'name',
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) =>
                        handleTeamMemberChange(
                          memberIndex,
                          'role',
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={member.location}
                    onChange={(e) =>
                      handleTeamMemberChange(
                        memberIndex,
                        'location',
                        e.target.value,
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={member.bio}
                    onChange={(e) =>
                      handleTeamMemberChange(memberIndex, 'bio', e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief introduction and background"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <div className="space-y-2">
                    {member.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) =>
                            handleTeamMemberSkillChange(
                              memberIndex,
                              skillIndex,
                              e.target.value,
                            )
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., React, Node.js, Solidity"
                        />
                        {member.skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeTeamMemberSkill(memberIndex, skillIndex)
                            }
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTeamMemberSkill(memberIndex)}
                      className="flex items-center text-sm text-blue-500 hover:text-blue-600"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTeamMember}
              className="flex items-center text-sm text-blue-500 hover:text-blue-600"
            >
              <Plus size={16} className="mr-1" />
              Add Team Member
            </button>
          </div>
        )
      default:
        return <div>Content not available</div>
    }
  }
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft size={16} className="mr-1" />
              <span>Back to Hackathon</span>
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold">Submit Your Project</h1>
                <p className="text-gray-600">
                  Fill out the form below to submit your project to the
                  hackathon
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Submit Project</span>
                  </>
                )}
              </button>
            </div>
            {/* Edit tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex flex-wrap -mb-px">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'basic' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Media
                </button>
                <button
                  onClick={() => setActiveTab('technical')}
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'technical' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Technical Details
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Team
                </button>
              </div>
            </div>
            {/* Form content */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                {renderTabContent()}
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Submit Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
