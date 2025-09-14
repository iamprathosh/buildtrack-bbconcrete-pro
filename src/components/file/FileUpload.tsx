import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  bucket: string;
  path?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  onUploadComplete?: (files: UploadedFile[]) => void;
  className?: string;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface FileProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  path = '',
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/vnd.ms-excel': ['.xls', '.xlsx'],
    'text/csv': ['.csv']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  onUploadComplete,
  className = ''
}) => {
  const [files, setFiles] = useState<FileProgress[]>([]);

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${path}${path ? '/' : ''}${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);

    const uploadPromises = newFiles.map(async (fileProgress, index) => {
      try {
        const url = await uploadFile(fileProgress.file);
        
        setFiles(prev => prev.map(f => 
          f.file === fileProgress.file 
            ? { ...f, progress: 100, status: 'completed', url }
            : f
        ));

        return {
          name: fileProgress.file.name,
          url,
          size: fileProgress.file.size,
          type: fileProgress.file.type
        };
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.file === fileProgress.file 
            ? { ...f, status: 'error' }
            : f
        ));
        
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${fileProgress.file.name}`,
          variant: "destructive"
        });
        
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as UploadedFile[];
    
    if (successfulUploads.length > 0) {
      onUploadComplete?.(successfulUploads);
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successfulUploads.length} file(s)`
      });
    }
  }, [bucket, path, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple: maxFiles > 1
  });

  const removeFile = (fileToRemove: FileProgress) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove.file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card 
        {...getRootProps()}
        className={`cursor-pointer transition-all duration-200 border-2 border-dashed ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className={`h-12 w-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-lg font-montserrat font-semibold mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Files'}
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files, {formatFileSize(maxSize)} each
          </p>
        </CardContent>
      </Card>

      {fileRejections.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Upload Errors</span>
            </div>
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="text-sm text-muted-foreground">
                {file.name}: {errors.map(e => e.message).join(', ')}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((fileProgress, index) => (
            <Card key={index} className="gradient-card border-0 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{fileProgress.file.name}</span>
                    <Badge variant={
                      fileProgress.status === 'completed' ? 'default' :
                      fileProgress.status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {fileProgress.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileProgress)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{formatFileSize(fileProgress.file.size)}</span>
                  <span>{fileProgress.file.type}</span>
                </div>

                {fileProgress.status === 'uploading' && (
                  <Progress value={fileProgress.progress} className="h-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};