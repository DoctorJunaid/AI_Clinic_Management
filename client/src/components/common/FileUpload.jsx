import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

const FileUpload = ({
  onUploadSuccess,
  onRemove,
  value = '',
  publicId = '',
  type = 'avatar', // 'avatar' or 'document'
  accept = 'image/*',
  maxSize = 2 * 1024 * 1024, // 2MB default
  label = 'Drag and drop or click to upload',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(value);
  const [currentPublicId, setCurrentPublicId] = useState(publicId);
  const [fileName, setFileName] = useState('');
  
  const fileInputRef = useRef(null);

  // Sync state if initial value changes
  useEffect(() => {
    if (value) setPreviewUrl(value);
    if (publicId) setCurrentPublicId(publicId);
  }, [value, publicId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (file.size > maxSize) {
      toast.error(`File size exceeds maximum limit of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    // Basic format validation
    const fileTypeMatch = accept.replace('/*', '/.*'); // handle image/*
    const regex = new RegExp(fileTypeMatch.split(',').map(ext => ext.trim()).join('|'), 'i');
    if (!file.type.match(regex)) {
      toast.error(`Invalid file type. Expected formats: ${accept}`);
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/api/v1/uploads/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const { url, publicId: newPublicId } = response.data.data;
      setPreviewUrl(url);
      setCurrentPublicId(newPublicId);
      
      if (onUploadSuccess) {
        onUploadSuccess({
          url,
          publicId: newPublicId,
          fileType: file.type,
          size: file.size,
          name: file.name
        });
      }
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = async (e) => {
    e.stopPropagation();
    if (!currentPublicId) {
      setPreviewUrl('');
      if (onRemove) onRemove({ publicId: '' });
      return;
    }

    const deletingToast = toast.loading('Deleting file...');
    try {
      await axios.delete(`/api/v1/uploads/${currentPublicId}`);
      
      setPreviewUrl('');
      const oldPublicId = currentPublicId;
      setCurrentPublicId('');
      setFileName('');
      
      if (onRemove) {
        onRemove({ publicId: oldPublicId });
      }
      
      toast.dismiss(deletingToast);
      toast.success('File removed successfully');
    } catch (error) {
      toast.dismiss(deletingToast);
      console.error('Delete error:', error);
      // Fallback: clear local states even if deletion fails on Cloudinary
      setPreviewUrl('');
      setCurrentPublicId('');
      setFileName('');
      if (onRemove) onRemove({ publicId: currentPublicId });
      toast.success('File cleared');
    }
  };

  const triggerInputClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const isPdf = (previewUrl && previewUrl.toLowerCase().includes('.pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf'));

  return (
    <div 
      className={`file-upload-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        width: '100%'
      }}
    >
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={previewUrl ? undefined : triggerInputClick}
        style={{
          border: '1px dashed var(--border-color, #cbd5e1)',
          borderRadius: '4px', // Crisp 4px clinical aesthetic
          padding: '1.25rem',
          textAlign: 'center',
          cursor: previewUrl ? 'default' : 'pointer',
          background: isDragging ? '#f8fafc' : '#ffffff',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          position: 'relative'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <Loader2 className="animate-spin" size={24} style={{ color: 'var(--primary, #000)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Uploading {uploadProgress}%</span>
            <div style={{ width: '80%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary, #000)', transition: 'width 0.1s ease' }}></div>
            </div>
          </div>
        ) : previewUrl ? (
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            {isPdf ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#f1f5f9', borderRadius: '4px', width: '100%', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fileName || 'Uploaded_Medical_Report.pdf'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    maxHeight: type === 'avatar' ? '80px' : '120px', 
                    maxWidth: '100%', 
                    borderRadius: type === 'avatar' ? '50%' : '4px', 
                    objectFit: 'cover',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'block'
                  }} 
                />
                <button
                  type="button"
                  onClick={handleClearFile}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>Click 'x' to remove / replace</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={16} style={{ color: '#64748b' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{label}</span>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 500 }}>
              Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB ({accept.split(',').map(x => x.replace('/*', '').toUpperCase()).join('/')})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
