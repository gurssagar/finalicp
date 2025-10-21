'use client';
import { Suspense } from 'react';
import { ProfileWorkExperience } from './ProfileWorkExperience'

function WorkContent() {
  return <ProfileWorkExperience />
}

export default function Work() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <WorkContent />
    </Suspense>
  );
}