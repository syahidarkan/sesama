'use client';

import { useState, useRef } from 'react';
import { uploadsApi } from '@/lib/api';

interface UploadedFile {
  id: string;
  filename: string;
  storedFilename: string;
  mimeType: string;
  size: number;
}

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  category?: string;
  entityType?: string;
  entityId?: string;
  fieldName?: string;
  isPublic?: boolean;
  required?: boolean;
  description?: string;
  onChange?: (files: UploadedFile[]) => void;
  value?: UploadedFile[];
  disabled?: boolean;
}

export default function FileUpload({
  label,
  accept = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,video/*',
  multiple = false,
  maxSize = 100,
  category,
  entityType,
  entityId,
  fieldName,
  isPublic = false,
  required = false,
  description,
  onChange,
  value = [],
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(value);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Validate file sizes
      for (const file of Array.from(files)) {
        if (file.size > maxSize * 1024 * 1024) {
          setError(`File ${file.name} melebihi batas ${maxSize}MB`);
          setUploading(false);
          return;
        }
      }

      const options = {
        category,
        entityType,
        entityId,
        fieldName,
        isPublic,
      };

      let response;
      if (multiple && files.length > 1) {
        response = await uploadsApi.uploadMultiple(Array.from(files), options);
      } else {
        response = await uploadsApi.uploadSingle(files[0], options);
      }

      const newFiles = Array.isArray(response.data) ? response.data : [response.data];

      const updatedFiles = multiple ? [...uploadedFiles, ...newFiles] : newFiles;
      setUploadedFiles(updatedFiles);
      onChange?.(updatedFiles);
      setProgress(100);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Gagal mengupload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = async (fileToRemove: UploadedFile) => {
    try {
      await uploadsApi.delete(fileToRemove.id);
      const updatedFiles = uploadedFiles.filter((f) => f.id !== fileToRemove.id);
      setUploadedFiles(updatedFiles);
      onChange?.(updatedFiles);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Gagal menghapus file');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word') || mimeType.includes('.doc')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('.xls')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('.ppt')) return '📑';
    return '📎';
  };

  const isImageFile = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : 'border-gray-300 hover:border-green-500 cursor-pointer'
        } ${uploading ? 'bg-blue-50 border-blue-300' : ''}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Mengupload file...</p>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="text-sm text-gray-600">
              {multiple
                ? 'Klik atau drag & drop file di sini'
                : 'Klik atau drag & drop file di sini'}
            </p>
            <p className="text-xs text-gray-500">
              Maksimal {maxSize}MB per file
            </p>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-gray-700">File yang diupload:</p>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isImageFile(file.mimeType) ? (
                    <img
                      src={uploadsApi.getFileUrl(file.storedFilename)}
                      alt={file.filename}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={uploadsApi.getFileUrl(file.storedFilename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Lihat
                  </a>
                  <a
                    href={uploadsApi.getDownloadUrl(file.storedFilename)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Download
                  </a>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
