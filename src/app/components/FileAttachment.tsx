import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Image, X, Check, AlertCircle } from 'lucide-react';

interface FileAttachmentProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File, preview?: string) => void;
}

export function FileAttachment({ isOpen, onClose, onFileSelect }: FileAttachmentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    code: ['text/javascript', 'text/typescript', 'text/html', 'text/css', 'application/json', 'text/markdown']
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const isFileAllowed = (file: File) => {
    const allAllowedTypes = [...allowedTypes.images, ...allowedTypes.documents, ...allowedTypes.code];
    return allAllowedTypes.includes(file.type) || file.name.match(/\.(txt|md|js|ts|jsx|tsx|html|css|json|py|java|cpp|c|php|rb|go|rs|swift|kt)$/i);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Check file size
    if (file.size > maxFileSize) {
      setError('File size must be less than 10MB');
      return;
    }

    // Check file type
    if (!isFileAllowed(file)) {
      setError('File type not supported. Please upload images, documents, or code files.');
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (allowedTypes.images.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, preview || undefined);
      resetState();
      onClose();
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (allowedTypes.images.includes(file.type)) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-slate-500" />;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Attach File 📎
            </h3>
            <button
              onClick={() => {
                resetState();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="p-6">
            {!selectedFile ? (
              <>
                {/* Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                      Drop your file here
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      or click to browse
                    </p>
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose File
                    </motion.button>
                  </motion.div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.doc,.docx,.js,.ts,.jsx,.tsx,.html,.css,.json,.md,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt"
                  />
                </div>

                {/* Supported formats */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supported: Images, Documents, Code files (max 10MB)
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* File Preview */}
                <div className="space-y-4">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {getFileIcon(selectedFile)}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                        </p>
                      </div>
                      <Check className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={resetState}
                      className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Choose Different
                    </motion.button>
                    <motion.button
                      onClick={handleSend}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Attach File
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}