
import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileLoaded: (content: string) => void;
  accept?: string;
  maxSize?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileLoaded, 
  accept = '.txt', 
  maxSize = 5 // MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.txt')) {
      setError('Please upload a text (.txt) file');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setFile(file);
        onFileLoaded(content);
      } catch (err) {
        setError('Failed to read file content');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  }, [maxSize, onFileLoaded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  }, [processFile]);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 transition-all duration-200 animate-fade-in",
          "flex flex-col items-center justify-center text-center",
          isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50",
          file ? "bg-secondary/30" : "bg-white/50 backdrop-blur-sm"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        
        {isLoading ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin-slow"></div>
            <p className="mt-4 text-sm text-gray-500">Processing file...</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center transition-all animate-scale-in">
            <div className="flex items-center space-x-2 mb-2">
              <File className="h-8 w-8 text-primary/80" />
              <span className="text-base font-medium">{file.name}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <button 
              onClick={handleRemoveFile}
              className="text-sm text-red-500 flex items-center hover:underline"
            >
              <X size={16} className="mr-1" /> Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary/80" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Email Data</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md">
              Drag and drop your text file containing email:password data or click the button below
            </p>
            <button
              onClick={handleButtonClick}
              className="btn-primary"
            >
              Select File
            </button>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-slide-up">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
