'use client'
import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ArrowRight } from 'lucide-react'

export default function ClientOrFreelancerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select how you'd like to use ICPWork - as a client looking for services or as a freelancer offering your skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Card */}
          <Link href="/client/dashboard" className="group">
            <Card className="h-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-500 cursor-pointer">
              <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Client</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Find and hire talented freelancers for your projects. Browse services, post jobs, and manage your projects.
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Go to Client Dashboard</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Freelancer Card */}
          <Link href="/freelancer/dashboard" className="group">
            <Card className="h-80 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-green-500 cursor-pointer">
              <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <Briefcase className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Freelancer</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Offer your services, manage your gigs, and grow your freelance business. Create services and connect with clients.
                </p>
                <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                  <span>Go to Freelancer Dashboard</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            You can always switch between roles later in your account settings.
          </p>
        </div>
      </div>
    </div>
  )
}

