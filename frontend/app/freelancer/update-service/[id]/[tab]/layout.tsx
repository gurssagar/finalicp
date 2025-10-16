'use client'
import { ServiceFormProvider } from '@/context/ServiceFormContext'

export default function UpdateServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ServiceFormProvider>{children}</ServiceFormProvider>
}