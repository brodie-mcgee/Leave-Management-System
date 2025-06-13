import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
export function AttachmentUploader({
  onUpload,
  existingUrl = null
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const handleFileChange = async e => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }
    setError('');
    setIsUploading(true);
    try {
      // Mock successful upload after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Create a mock URL for the uploaded file
      const mockUrl = `https://mock-upload-url.com/${file.name}`;
      setUploadedUrl(mockUrl);
      setIsUploading(false);
      onUpload(mockUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload file: ${error.message}`);
      setIsUploading(false);
    }
  };
  const clearUpload = () => {
    setUploadedUrl(null);
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  if (uploadedUrl) {
    return <div className="flex items-center p-3 border rounded-lg bg-gray-50">
        <FileText className="text-blue-500 w-5 h-5 mr-2" />
        <div className="flex-1 truncate">
          <span className="text-sm">Document uploaded</span>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-500 hover:underline truncate">
            {uploadedUrl.split('/').pop()}
          </a>
        </div>
        <button onClick={clearUpload} className="ml-2 text-gray-500 hover:text-red-500" type="button">
          <X className="w-5 h-5" />
        </button>
      </div>;
  }
  return <div className="relative">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} accept=".pdf,image/*" />
      <div onClick={handleClick} className={`
          flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
          cursor-pointer transition-colors relative
        `}>
        {isUploading ? <div className="flex flex-col items-center text-gray-500">
            <div className="w-5 h-5 border-2 border-t-blue-500 border-gray-300 rounded-full animate-spin mb-2"></div>
            <span>Uploading...</span>
          </div> : <div className="flex flex-col items-center text-gray-500">
            {error ? <AlertCircle className="w-6 h-6 mb-2 text-red-500" /> : <Upload className="w-6 h-6 mb-2" />}
            <span className="text-sm font-medium text-center">
              {error || 'Click to upload a document (PDF or image)'}
            </span>
            <span className="text-xs mt-1">Max file size: 5MB</span>
          </div>}
      </div>
    </div>;
}