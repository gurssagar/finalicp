import { Icpay, IcpayError } from '@ic-pay/icpay-sdk'

// Server-side ICPay instance with secret key
export function createICPayServerClient() {
  if (!process.env.ICPAY_SECRET_KEY) {
    throw new Error('ICPAY_SECRET_KEY is not configured')
  }

  return new Icpay({
    secretKey: process.env.ICPAY_SECRET_KEY,
    environment: 'production',
    debug: process.env.NODE_ENV === 'development',
  })
}

// Verify a payment transaction
export async function verifyPayment(paymentId: string) {
  const icpay = createICPayServerClient()
  
  try {
    // Get payment details using the secret key
    // Note: The actual method name may vary based on ICPay SDK documentation
    // This is a placeholder - adjust based on actual SDK methods
    const payment = await (icpay as any).getPayment(paymentId)
    return payment
  } catch (error) {
    if (error instanceof IcpayError) {
      console.error('ICPay Server Error:', {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      })
    }
    throw error
  }
}

// Get transaction history for an account
export async function getTransactionHistory(accountId: string, limit = 50) {
  const icpay = createICPayServerClient()
  
  try {
    // Fetch transaction history using secret key
    const history = await (icpay as any).getTransactions({
      accountId,
      limit,
    })
    return history
  } catch (error) {
    if (error instanceof IcpayError) {
      console.error('ICPay Server Error:', {
        code: error.code,
        message: error.message,
      })
    }
    throw error
  }
}

// Verify webhook signature (if ICPay provides webhook functionality)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // This is a placeholder implementation
    // Actual implementation depends on ICPay's webhook signature mechanism
    // Typically uses HMAC SHA256
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}

// Get payment status by transaction ID
export async function getPaymentStatus(transactionId: string) {
  const icpay = createICPayServerClient()
  
  try {
    // Get transaction status
    const status = await (icpay as any).getTransactionStatus(transactionId)
    return status
  } catch (error) {
    if (error instanceof IcpayError) {
      console.error('ICPay Server Error:', {
        code: error.code,
        message: error.message,
      })
    }
    throw error
  }
}

// Helper to validate payment metadata
export function validatePaymentMetadata(metadata: Record<string, any>): boolean {
  const requiredFields = ['serviceId', 'packageId']
  
  for (const field of requiredFields) {
    if (!metadata[field]) {
      console.error(`Missing required metadata field: ${field}`)
      return false
    }
  }
  
  return true
}

export { IcpayError }

