'use client'

import { useEffect, useRef } from 'react'
import '@ic-pay/icpay-widget'

interface ICPayWidgetProps {
  amountUsd: number
  metadata?: Record<string, any>
  onSuccess?: (event: any) => void
  onError?: (event: any) => void
  buttonLabel?: string
  defaultSymbol?: 'ICP' | 'ckUSDC' | 'ckBTC' | 'ckETH'
  showLedgerDropdown?: 'always' | 'none' | 'auto'
  cryptoOptions?: Array<{
    symbol: string
    label: string
  }>
}

// Extend JSX to include the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'icpay-pay-button': any
    }
  }
}

export function ICPayWidget({
  amountUsd,
  metadata = {},
  onSuccess,
  onError,
  buttonLabel = 'Pay ${amount} with {symbol}',
  defaultSymbol = 'ICP',
  showLedgerDropdown = 'always',
  cryptoOptions = [
    { symbol: 'ICP', label: 'Internet Computer' },
    { symbol: 'ckUSDC', label: 'Chain Key USDC' },
    { symbol: 'ckBTC', label: 'Chain Key Bitcoin' },
    { symbol: 'ckETH', label: 'Chain Key Ethereum' }
  ]
}: ICPayWidgetProps) {
  const elRef = useRef<any>(null)

  useEffect(() => {
    const el = elRef.current as any
    if (!el) return

    // Configure the widget
    el.config = {
      publishableKey: process.env.NEXT_PUBLIC_ICPAY_PUBLISHABLE_KEY,
      amountUsd,
      buttonLabel,
      defaultSymbol,
      showLedgerDropdown,
      cryptoOptions,
      metadata: {
        ...metadata,
        timestamp: Date.now()
      }
    }

    // Event handlers
    const handleSuccess = (e: any) => {
      console.log('✅ ICPay payment successful:', e.detail)
      if (onSuccess) {
        onSuccess(e.detail)
      }
    }

    const handleError = (e: any) => {
      console.error('❌ ICPay payment error:', e.detail)
      if (onError) {
        onError(e.detail)
      }
    }

    // Add event listeners
    el.addEventListener('icpay-pay', handleSuccess)
    el.addEventListener('icpay-error', handleError)

    // Cleanup
    return () => {
      el.removeEventListener('icpay-pay', handleSuccess)
      el.removeEventListener('icpay-error', handleError)
    }
  }, [amountUsd, buttonLabel, defaultSymbol, showLedgerDropdown, metadata, onSuccess, onError])

  return (
    <div className="w-full">
      <icpay-pay-button ref={elRef}></icpay-pay-button>
    </div>
  )
}

