"use client"
import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProgressStepper } from '@/components/progress-stepper'
import { ProfilePreview } from '@/components/profilePreview'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { OtpInput } from '@/components/otp-input'
export function ProfileSetup() {
  const navigate = useRouter()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageName, setProfileImageName] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])
      setProfileImageName(e.target.files[0].name)
    }
  }
  const handleNext = () => {
    // Save profile details and navigate to next step
    navigate.push('/verification-complete')
  }
  const handleBack = () => {
    navigate.push('/onboarding/address')
  }
  const handleVerifyCode = () => {
    // Verify code logic here
    console.log('Verifying code:', verificationCode)
    // If successful, navigate to next step
    navigate.push('/verification-complete')
  }
  const handleResendCode = () => {
    // Resend code logic here
    console.log('Resending code')
  }
  const handleSubmitPhone = () => {
    // Submit phone number and show verification input
    setShowVerification(true)
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc]">
      <Header />
      <div className="flex-1">
        <div className="container mx-auto py-8 px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="mb-8">
                <ProgressStepper currentStep={4} totalSteps={5} />
              </div>
              <h1 className="text-3xl font-bold text-[#161616] mb-8">
                Add profile Image and verify your number
              </h1>
              <div className="mb-8">
                <label className="block text-xs text-gray-500 mb-1 ml-1">
                  ADD PROFILE PHOTO
                </label>
                <div className="border border-[#cacaca] rounded-md p-4 flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <span className="text-gray-600 hover:underline">
                      {profileImageName || 'Click here to upload Profile image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-500 mb-2 ml-1">OPTIONAL</p>
                {!showVerification ? (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 ml-1">
                      PHONE NUMBER
                    </label>
                    <div className="flex">
                      <div className="relative w-24">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full h-full py-3 px-2 border border-[#cacaca] rounded-l-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                        >
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+91">+91</option>
                        </select>
                        <ChevronDown
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Enter Your Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 py-3 px-4 border-y border-r border-[#cacaca] rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2ba24c] text-[#161616]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2">
                        Enter Verification code
                      </label>
                      <OtpInput
                        length={6}
                        onChange={setVerificationCode}
                        hasInitialValue={false}
                      />
                    </div>
                    <button
                      onClick={handleVerifyCode}
                      className="w-full bg-[#000000] text-white py-3 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors mb-4"
                    >
                      Verify Code
                    </button>
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-gray-600">Didn't Recieved ? </span>
                      <button
                        onClick={handleResendCode}
                        className="text-[#2ba24c] hover:underline"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {!showVerification && (
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleBack}
                    className="px-12 py-3 border border-[#000000] rounded-full font-bold text-[#161616] hover:bg-gray-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={phoneNumber ? handleSubmitPhone : handleNext}
                    className="px-12 py-3 bg-[#000000] text-white rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <ProfilePreview location="California, CA, USA" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
