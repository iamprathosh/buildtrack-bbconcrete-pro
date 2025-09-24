'use client'

import React, { useCallback, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  X, 
  FileImage,
  Loader2
} from 'lucide-react'

interface ImageUploadProps {
  value?: string | File
  onChange: (file: File | null) => void
  disabled?: boolean
  className?: string
  maxSizeKB?: number
  acceptedFormats?: string[]
  showPreview?: boolean
  label?: string
  placeholder?: string
  error?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  maxSizeKB = 5120, // 5MB default
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showPreview = true,
  label = 'Product Image',
  placeholder = 'Drop an image here or click to browse',
  error
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Set preview URL when value changes
  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else if (typeof value === 'string' && value) {
      setPreviewUrl(value)
    } else {
      setPreviewUrl(null)
    }
  }, [value])

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Please select a valid image file (${acceptedFormats.join(', ')})`
    }
    
    if (file.size > maxSizeKB * 1024) {
      return `File size must be less than ${maxSizeKB / 1024}MB`
    }
    
    return null
  }

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      // You could show a toast here or pass error to parent
      console.error('File validation error:', validationError)
      return
    }

    setIsUploading(true)
    
    // Simulate upload delay (remove this in production)
    setTimeout(() => {
      onChange(file)
      setIsUploading(false)
    }, 500)
  }, [onChange, acceptedFormats, maxSizeKB])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileSelect(imageFile)
    }
  }, [disabled, handleFileSelect])

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input to allow selecting the same file again
    e.target.value = ''
  }

  const handleRemove = () => {
    onChange(null)
    setPreviewUrl(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      
      {/* Drag and Drop Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-all duration-200',
          isDragOver && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-primary/50 cursor-pointer',
          error && 'border-destructive'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && galleryInputRef.current?.click()}
      >
        {showPreview && previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <FileImage className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            
            <p className="text-sm font-medium text-foreground mb-1">
              {isUploading ? 'Uploading...' : placeholder}
            </p>
            
            <p className="text-xs text-muted-foreground mb-4">
              Supports: {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()}
              <br />
              Maximum size: {maxSizeKB / 1024}MB
            </p>

            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-xs">Drop files here</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => galleryInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Gallery
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        className="hidden"
        onChange={handleGallerySelect}
        disabled={disabled}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        capture="environment"
        className="hidden"
        onChange={handleGallerySelect}
        disabled={disabled}
      />

      {/* Error Message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        On mobile devices, "Camera" will open your device's camera app for taking photos.
      </p>
    </div>
  )
}