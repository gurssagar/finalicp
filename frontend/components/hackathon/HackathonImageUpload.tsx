'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadImageToTebi, validateImageFile, getFilePreview, revokeFilePreview, type UploadResult } from '@/lib/tebi-s3-upload';

interface HackathonImageUploadProps {
  onImageSelect: (file: File | null, url?: string) => void;
  currentImage?: string | null;
  className?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function HackathonImageUpload({
  onImageSelect,
  currentImage,
  className = '',
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}: HackathonImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview from currentImage prop
  React.useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    } else {
      setPreview(null);
    }
  }, [currentImage]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const uploadToHackathonEndpoint = async (file: File): Promise<UploadResult> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      // We could add hackathonId here if we have it, but for now it's optional

      const response = await fetch('/api/hackathons/upload-image', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          url: result.url,
          key: result.key
        }
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed'
        }
      }
    } catch (error) {
      console.error('Hackathon upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  const processFile = useCallback(async (file: File) => {
    console.log('Starting file processing for:', file.name);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      // Enhanced validation
      setUploadProgress(10);
      const validation = await validateImageFile(file);
      setUploadProgress(20);

      if (!validation.isValid) {
        console.error('File validation failed:', validation.error);
        setUploadError(validation.error || 'Invalid file');
        return;
      }

      console.log('File validation passed');

      // Create local preview immediately
      const previewUrl = getFilePreview(file);
      setPreview(previewUrl);
      onImageSelect(file, previewUrl);
      setUploadProgress(30);

      // Upload to S3 with retry logic
      console.log('Starting upload to S3...');
      setIsUploading(true);
      setUploadProgress(40);

      // Use specialized hackathon upload endpoint
      const result = await uploadToHackathonEndpoint(file);
      setUploadProgress(90);

      if (result.success && result.url) {
        console.log('Upload successful:', result.url);
        setPreview(result.url);
        onImageSelect(file, result.url);
        setUploadSuccess(true);
        setUploadProgress(100);

        // Clean up local preview if we have the remote URL
        if (previewUrl !== result.url) {
          revokeFilePreview(previewUrl);
        }

        // Show success message briefly
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } else {
        console.error('Upload failed:', result.error);
        setUploadError(result.error || 'Upload failed');
        onImageSelect(null);

        // Clean up local preview on failure
        revokeFilePreview(previewUrl);
      }
    } catch (error) {
      console.error('Critical upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      onImageSelect(null);

      // Clean up preview on error
      if (preview) {
        revokeFilePreview(preview);
      }
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  }, [maxSize, onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleRemoveImage = useCallback(() => {
    if (preview) {
      revokeFilePreview(preview);
    }
    setPreview(null);
    onImageSelect(null);
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [preview, onImageSelect]);

  const handleClick = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="block text-sm font-medium text-gray-700 mb-2">
        Hackathon Banner Image
        <span className="text-gray-400 font-normal ml-1">(Optional)</span>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-blue-400 bg-blue-50'
            : isUploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploadError ? 'border-red-300 bg-red-50' : ''}
          ${uploadSuccess ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {/* Preview Image */}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Hackathon banner preview"
              className="w-full h-48 object-cover rounded-lg"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X size={16} />
            </button>

            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <div className="text-sm">Uploading... {uploadProgress}%</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Prompt */}
        {!preview && (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">Uploading...</p>
                    <p className="text-sm text-gray-500">{uploadProgress}%</p>
                  </div>
                </>
              ) : (
                <>
                  {uploadSuccess ? (
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  ) : uploadError ? (
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400" />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {uploadSuccess ? 'Upload Successful!' : uploadError ? 'Upload Failed' : 'Upload Hackathon Banner'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {uploadSuccess
                        ? 'Your image has been uploaded successfully.'
                        : uploadError
                          ? uploadError
                          : 'Drag and drop an image here, or click to select'
                      }
                    </p>
                    {uploadError && (
                      <div className="mt-2 text-xs">
                        {uploadError.includes('size') && (
                          <p className="text-orange-600">💡 Try compressing the image or choosing a smaller file.</p>
                        )}
                        {uploadError.includes('type') && (
                          <p className="text-orange-600">💡 Make sure the file is a valid image (JPEG, PNG, GIF, or WebP).</p>
                        )}
                        {uploadError.includes('Network') || uploadError.includes('timeout') ? (
                          <p className="text-orange-600">💡 Check your internet connection and try again.</p>
                        ) : (
                          <p className="text-orange-600">💡 If the problem persists, try a different image.</p>
                        )}
                      </div>
                    )}
                    {!uploadSuccess && !uploadError && (
                      <p className="text-xs text-gray-400 mt-2">
                        Supported formats: JPEG, PNG, GIF, WebP (max {maxSize}MB)
                      </p>
                    )}
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {uploadError ? 'Try Again' : 'Choose Image'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-200 rounded-b-lg overflow-hidden">
            <div
              className="bg-blue-600 h-1 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Image Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <ImageIcon className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Image Guidelines:</p>
            <ul className="text-xs space-y-1 text-gray-500">
              <li>• Recommended size: 1920x1080 pixels (16:9 aspect ratio)</li>
              <li>• Maximum file size: {maxSize}MB</li>
              <li>• Use high-quality images that represent your hackathon</li>
              <li>• Avoid text-heavy images; add details in the description</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}