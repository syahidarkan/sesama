'use client';

import { useState, useRef } from 'react';
import { uploadsApi } from '@/lib/api';
import { FileImage, Video, FileText, FileSpreadsheet, File, Upload, Loader2, Eye, Download, X } from 'lucide-react';

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
    if (mimeType.startsWith('image/')) return <FileImage className="w-6 h-6 text-teal-600" />;
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6 text-teal-600" />;
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-600" />;
    if (mimeType.includes('word') || mimeType.includes('.doc')) return <FileText className="w-6 h-6 text-cyan-600" />;
    if (mimeType.includes('excel') || mimeType.includes('.xls')) return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
    if (mimeType.includes('powerpoint') || mimeType.includes('.ppt')) return <FileText className="w-6 h-6 text-teal-600" />;
    return <File className="w-6 h-6 text-gray-600" />;
  };

  const isImageFile = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center transition-all group ${
          disabled
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
            : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50/30 cursor-pointer'
        } ${uploading ? 'bg-orange-50 border-orange-300' : ''}`}
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
          <div className="space-y-3 animate-fadeIn">
            <Loader2 className="w-8 h-8 text-teal-600 mx-auto animate-spin" />
            <p className="text-sm text-gray-600">Mengupload file...</p>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 text-gray-400 mx-auto transition-all group-hover:text-teal-600 group-hover:scale-110 group-hover:animate-bounce-slow" />
            <p className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">
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
        <div className="space-y-2 mt-4 animate-fadeIn">
          <p className="text-sm font-medium text-gray-900">File yang diupload:</p>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:border-orange-300 transition-all hover:shadow-sm group animate-fadeIn"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isImageFile(file.mimeType) ? (
                    <img
                      src={uploadsApi.getFileUrl(file.storedFilename)}
                      alt={file.filename}
                      className="w-10 h-10 object-cover rounded transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="shrink-0 transition-transform group-hover:scale-110">{getFileIcon(file.mimeType)}</div>
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
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={uploadsApi.getFileUrl(file.storedFilename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-teal-600 hover:bg-orange-50 rounded transition-all hover:scale-110"
                    title="Lihat"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={uploadsApi.getDownloadUrl(file.storedFilename)}
                    className="p-1.5 text-teal-600 hover:bg-orange-50 rounded transition-all hover:scale-110"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all hover:scale-110"
                      title="Hapus"
                    >
                      <X className="w-4 h-4" />
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
