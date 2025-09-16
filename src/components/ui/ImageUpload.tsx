import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  onImageUpload?: (url: string) => void;
  currentImage?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function ImageUpload({
  onImageUpload,
  currentImage,
  className,
  disabled = false,
  label = "Product Image"
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading } = useImageUpload();

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload image
    const uploadedUrl = await uploadImage(file);
    if (uploadedUrl && onImageUpload) {
      onImageUpload(uploadedUrl);
    }

    // Clean up preview URL
    return () => URL.revokeObjectURL(previewUrl);
  }, [uploadImage, onImageUpload]);

  const handleGallerySelect = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  const handleCameraCapture = useCallback(() => {
    if (disabled || isUploading) return;
    cameraInputRef.current?.click();
  }, [disabled, isUploading]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const removeImage = useCallback(() => {
    if (disabled || isUploading) return;
    setPreview(null);
    if (onImageUpload) {
      onImageUpload('');
    }
    // Clear file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, [disabled, isUploading, onImageUpload]);

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      
      <div className="space-y-4">
        {/* Image Preview */}
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {!disabled && !isUploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">No image selected</p>
              <p className="text-xs text-gray-400 mt-1">Click buttons below to add image</p>
            </div>
          </div>
        )}

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGallerySelect}
            disabled={disabled || isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Gallery'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleCameraCapture}
            disabled={disabled || isUploading}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Camera
          </Button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="text-xs text-gray-500">
          Supported formats: JPEG, PNG, WebP. Max size: 5MB.
        </div>
      </div>
    </div>
  );
}