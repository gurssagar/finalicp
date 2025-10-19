'use client'
import React, { useEffect, useState } from 'react';
import { CreditCard, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export function PaymentProcessing() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processingSteps = [
    {
      title: 'Initializing Payment',
      description: 'Setting up secure payment connection...',
      icon: CreditCard,
      duration: 1000
    },
    {
      title: 'Verifying Payment Method',
      description: 'Authenticating your payment details...',
      icon: Shield,
      duration: 1500
    },
    {
      title: 'Processing Transaction',
      description: 'Completing secure payment transfer...',
      icon: CreditCard,
      duration: 2000
    },
    {
      title: 'Confirming Booking',
      description: 'Setting up your service order and chat...',
      icon: CheckCircle,
      duration: 1500
    }
  ];

  useEffect(() => {
    const runProcessingSequence = async () => {
      for (let i = 0; i < processingSteps.length; i++) {
        if (error) break;

        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, processingSteps[i].duration));
      }
    };

    runProcessingSequence();
  }, [error]);

  const currentStepData = processingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {error ? (
              <AlertCircle size={32} className="text-white" />
            ) : (
              <CreditCard size={32} className="text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Payment Failed' : 'Processing Payment'}
          </h1>
          <p className="text-gray-600">
            {error ? error : currentStepData.description}
          </p>
        </div>

        {!error && (
          <>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {processingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <div key={index} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isActive
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      {index < processingSteps.length - 1 && (
                        <div className={`w-full h-1 mx-2 transition-colors ${
                          index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step Titles */}
              <div className="flex items-center justify-between text-xs">
                {processingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex-1 text-center ${
                      index === currentStep ? 'text-purple-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="text-green-600 mt-1" size={20} />
                <div className="text-sm text-green-700">
                  <div className="font-medium mb-1">Secure Processing</div>
                  <p>Your payment is being processed securely with 256-bit SSL encryption.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="text-center">
            <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Try Again
            </button>
            <button className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Contact Support
            </button>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Please don't close this window while payment is being processed.
        </div>
      </div>
    </div>
  );
}