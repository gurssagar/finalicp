// Tebi S3 Configuration (client-side only needs public config)
const getTebiConfig = () => {
  return {
    bucket: process.env.NEXT_PUBLIC_TEBI_BUCKET_NAME!,
    endpoint: process.env.NEXT_PUBLIC_TEBI_ENDPOINT!
  }
}

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

/**
 * Enhanced upload function with retry logic and better error handling
 * @param file The image file to upload
 * @param folder Optional folder path (e.g., 'portfolio', 'hackathons')
 * @param maxRetries Maximum number of retry attempts
 * @returns Promise<UploadResult> containing the upload result
 */
export async function uploadImageToTebi(
  file: File,
  folder: string = 'portfolio',
  maxRetries: number = 3
): Promise<UploadResult> {
  try {
    // Validate file first
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Run enhanced validation
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'File validation failed'
      }
    }

    // Upload with retry logic
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries} for file: ${file.name}`)

        // Create FormData to send to server
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)
        formData.append('attempt', attempt.toString())

        // Upload via server-side API with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch('/api/upload/s3', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const result = await response.json()

        if (response.ok && result.success) {
          console.log('Upload successful:', result.url)
          return result
        } else {
          lastError = new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            console.error('Client error, not retrying:', result.error)
            break
          }

          // If this is not the last attempt, wait before retrying
          if (attempt < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Exponential backoff, max 5s
            console.log(`Upload failed, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown upload error')
        console.error(`Upload attempt ${attempt} failed:`, lastError.message)

        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          console.log(`Upload error, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError?.message || 'Upload failed after multiple attempts'
    }

  } catch (error) {
    console.error('Critical error during upload:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Critical upload error occurred'
    }
  }
}

/**
 * Delete an image from Tebi S3 storage
 * @param key The S3 key of the file to delete
 * @returns Promise<UploadResult> containing the deletion result
 */
export async function deleteImageFromTebi(key: string): Promise<UploadResult> {
  // TODO: Implement server-side delete API if needed
  console.warn('deleteImageFromTebi is not yet implemented with server-side API')
  return {
    success: false,
    error: 'Delete functionality not yet implemented'
  }
}

/**
 * Upload multiple images to Tebi S3 storage
 * @param files Array of image files to upload
 * @param folder Optional folder path
 * @returns Promise<UploadResult[]> containing upload results for each file
 */
export async function uploadMultipleImagesToTebi(
  files: File[],
  folder: string = 'portfolio'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImageToTebi(file, folder))
  return Promise.all(uploadPromises)
}

/**
 * Enhanced image file validation with file signature checking
 * @param file The file to validate
 * @returns Promise<Object> containing validation result and error message
 */
export async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Check if file exists
    if (!file) {
      return { isValid: false, error: 'No file provided' }
    }

    // Check file type (both MIME type and extension)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Invalid file type: ${file.type}. Only JPEG, PNG, GIF, and WebP images are allowed.`
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`
      }
    }

    // Check minimum file size (1KB)
    if (file.size < 1024) {
      return {
        isValid: false,
        error: 'File too small. Minimum size is 1KB.'
      }
    }

    // Validate file content by checking image dimensions and corruption
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      // Set timeout for image loading
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
        resolve({
          isValid: false,
          error: 'Image loading timeout. The file may be corrupted or invalid.'
        })
      }, 10000) // 10 second timeout

      img.onload = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(objectUrl)

        // Check minimum dimensions
        if (img.width < 100 || img.height < 100) {
          resolve({
            isValid: false,
            error: `Image too small (${img.width}x${img.height}). Minimum dimensions are 100x100 pixels.`
          })
          return
        }

        // Check maximum dimensions (reasonable limit)
        if (img.width > 8192 || img.height > 8192) {
          resolve({
            isValid: false,
            error: `Image too large (${img.width}x${img.height}). Maximum dimensions are 8192x8192 pixels.`
          })
          return
        }

        // Validate aspect ratio (optional - prevent extremely wide/tall images)
        const aspectRatio = img.width / img.height
        if (aspectRatio > 10 || aspectRatio < 0.1) {
          resolve({
            isValid: false,
            error: 'Extreme aspect ratio detected. Please use a more standard image format.'
          })
          return
        }

        resolve({ isValid: true })
      }

      img.onerror = () => {
        clearTimeout(timeout)
        URL.revokeObjectURL(objectUrl)
        resolve({
          isValid: false,
          error: 'Invalid or corrupted image file. The file may be damaged or not a valid image.'
        })
      }

      img.src = objectUrl
    })
  } catch (error) {
    console.error('Validation error:', error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error occurred'
    }
  }
}

/**
 * Get a preview URL for a local file
 * @param file The file to get preview for
 * @returns Preview URL string
 */
export function getFilePreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke a preview URL to free up memory
 * @param url The preview URL to revoke
 */
export function revokeFilePreview(url: string): void {
  URL.revokeObjectURL(url)
}