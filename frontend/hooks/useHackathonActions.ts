'use client'

import { useState, useCallback } from 'react'
import { useUserContext } from '@/contexts/UserContext'
import { HackathonCanister } from '@/lib/hackathon-canister'

interface HackathonActionState {
  isLoading: boolean
  error: string | null
  success: string | null
}

interface HackathonActionsHook {
  updateHackathonStatus: (hackathonId: string, status: string) => Promise<boolean>
  duplicateHackathon: (hackathonId: string) => Promise<boolean>
  deleteHackathon: (hackathonId: string) => Promise<boolean>
  bulkUpdateStatus: (hackathonIds: string[], status: string) => Promise<boolean>
  bulkDelete: (hackathonIds: string[]) => Promise<boolean>
  bulkDuplicate: (hackathonIds: string[]) => Promise<boolean>
  exportHackathons: (hackathonIds: string[]) => Promise<boolean>
  generateReport: (hackathonIds: string[]) => Promise<boolean>
  state: HackathonActionState
  clearMessages: () => void
}

export function useHackathonActions(): HackathonActionsHook {
  const [state, setState] = useState<HackathonActionState>({
    isLoading: false,
    error: null,
    success: null
  })
  const { profile } = useUserContext()

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, success: null }))
  }

  const setSuccess = (success: string | null) => {
    setState(prev => ({ ...prev, success, error: null }))
  }

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }))
  }, [])

  const getCurrentUserId = useCallback(() => {
    // Get user ID from profile - use email as primary identifier
    const userId = profile.email
    if (!userId) {
      throw new Error('User not authenticated')
    }
    return userId
  }, [profile])

  // Simulate API call delay
  const simulateApiCall = async (delay: number = 1000) => {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const updateHackathonStatus = useCallback(async (hackathonId: string, status: string): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      const userId = getCurrentUserId()
      console.log(`Updating hackathon ${hackathonId} status to ${status} for user ${userId}`)

      // Use real canister method
      await HackathonCanister.updateHackathonStatus(hackathonId, status, userId)

      setSuccess(`Hackathon status updated to ${status} successfully`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hackathon status'
      console.error('Error updating hackathon status:', error)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages, getCurrentUserId])

  const duplicateHackathon = useCallback(async (hackathonId: string): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      const userId = getCurrentUserId()
      console.log(`Duplicating hackathon ${hackathonId} for user ${userId}`)

      // Use real canister method
      await HackathonCanister.duplicateHackathon(hackathonId, userId)

      setSuccess('Hackathon duplicated successfully')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate hackathon'
      console.error('Error duplicating hackathon:', error)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages, getCurrentUserId])

  const deleteHackathon = useCallback(async (hackathonId: string): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      const userId = getCurrentUserId()
      console.log(`Deleting hackathon ${hackathonId} for user ${userId}`)

      // Use real canister method
      await HackathonCanister.deleteHackathonAsOrganizer(hackathonId, userId)

      setSuccess('Hackathon deleted successfully')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hackathon'
      console.error('Error deleting hackathon:', error)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages, getCurrentUserId])

  const bulkUpdateStatus = useCallback(async (hackathonIds: string[], status: string): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      const userId = getCurrentUserId()
      console.log(`Bulk updating ${hackathonIds.length} hackathons status to ${status} for user ${userId}`)

      // Use real canister methods for each hackathon
      const updatePromises = hackathonIds.map(hackathonId =>
        HackathonCanister.updateHackathonStatus(hackathonId, status, userId)
      )

      await Promise.all(updatePromises)

      setSuccess(`${hackathonIds.length} hackathons updated to ${status} successfully`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hackathons status'
      console.error('Error bulk updating hackathon status:', error)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages, getCurrentUserId])

  const bulkDelete = useCallback(async (hackathonIds: string[]): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      const userId = getCurrentUserId()
      console.log(`Bulk deleting ${hackathonIds.length} hackathons for user ${userId}`)

      // Use real canister methods for each hackathon
      const deletePromises = hackathonIds.map(hackathonId =>
        HackathonCanister.deleteHackathonAsOrganizer(hackathonId, userId)
      )

      await Promise.all(deletePromises)

      setSuccess(`${hackathonIds.length} hackathons deleted successfully`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hackathons'
      console.error('Error bulk deleting hackathons:', error)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages, getCurrentUserId])

  const bulkDuplicate = useCallback(async (hackathonIds: string[]): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      const userId = getCurrentUserId()
      console.log(`Bulk duplicating ${hackathonIds.length} hackathons for user ${userId}`)

      // Use real canister methods for each hackathon
      const duplicatePromises = hackathonIds.map(hackathonId =>
        HackathonCanister.duplicateHackathon(hackathonId, userId)
      )

      await Promise.all(duplicatePromises)

      setSuccess(`${hackathonIds.length} hackathons duplicated successfully`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate hackathons'
      console.error('Error bulk duplicating hackathons:', error)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages, getCurrentUserId])

  const exportHackathons = useCallback(async (hackathonIds: string[]): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      await simulateApiCall(800)

      console.log(`Exporting ${hackathonIds.length} hackathons`)

      // Simulate CSV download
      const csvContent = `ID,Title,Status,StartDate,EndDate,Participants\n${hackathonIds.map(id =>
        `${id},Sample Hackathon,active,2024-03-15,2024-03-17,100`
      ).join('\n')}`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hackathons_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccess(`Exported ${hackathonIds.length} hackathons to CSV`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export hackathons'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages])

  const generateReport = useCallback(async (hackathonIds: string[]): Promise<boolean> => {
    setLoading(true)
    clearMessages()

    try {
      await simulateApiCall(2500)

      console.log(`Generating report for ${hackathonIds.length} hackathons`)

      if (Math.random() > 0.1) {
        setSuccess(`Comprehensive report generated for ${hackathonIds.length} hackathons`)
        return true
      } else {
        throw new Error('Failed to generate report')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [clearMessages])

  return {
    updateHackathonStatus,
    duplicateHackathon,
    deleteHackathon,
    bulkUpdateStatus,
    bulkDelete,
    bulkDuplicate,
    exportHackathons,
    generateReport,
    state,
    clearMessages
  }
}