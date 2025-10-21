import React, { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { OtpInput } from '@/components/otp-input'

export function VerifyCode() {

  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(105) // 1:45 in seconds
  const [canResend, setCanResend] = useState(false)
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  const handleResendCode = () => {
    if (!canResend) return
    // Reset timer and disable resend button
    setTimeLeft(105)
    setCanResend(false)
    // Logic to resend code would go here
  }
  const handleVerify = () => {
    // Verification logic would go here
    console.log('Verifying code:', otp)
    // If successful, redirect to success page
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc]">
      <Header />
      <main className="flex-1 flex flex-col justify-center items-center py-8 px-4">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-center text-3xl font-bold text-[#161616] mb-4">
            Verify Code
          </h1>
          <p className="text-center text-gray-600 mb-8">
            A 6-digit OTP sent to organansie@gmail.com
          </p>
          <div className="mb-8">
            <OtpInput length={6} onChange={setOtp} hasInitialValue={false} />
          </div>
          <button
            onClick={handleVerify}
            className="w-full bg-[#000000] text-white py-3 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors mb-6"
          >
            Verify Code
          </button>
          <div className="flex justify-center items-center gap-2 text-center">
            <span className="text-[#ff3b30] font-medium">
              {formatTime(timeLeft)}
            </span>
            <div>
              <span className="text-gray-600">Didn't Recieved ? </span>
              <button
                onClick={handleResendCode}
                disabled={!canResend}
                className={`${canResend ? 'text-[#2ba24c] hover:underline' : 'text-gray-400'}`}
              >
                Resend Code
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
