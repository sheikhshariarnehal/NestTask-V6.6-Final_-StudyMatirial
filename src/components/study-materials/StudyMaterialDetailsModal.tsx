import { X, Book, Calendar, Download, ExternalLink, FileText, Link, Lock, Clock, Tag, Eye, File, Presentation, Beaker, Microscope, Activity, Building, Users, GraduationCap, Image, Video, Music, Archive, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyMaterial } from '../../types/course';
import { useState, useCallback, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface StudyMaterialDetailsModalProps {
  material: StudyMaterial;
  isOpen: boolean;
  onClose: () => void;
}

// Animation variants for different screen sizes
const modalVariants = {
  desktop: {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 400,
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 350,
        mass: 0.5
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        type: "spring",
        damping: 35,
        stiffness: 400
      }
    }
  },
  mobile: {
    hidden: { 
      opacity: 0,
      y: '100%',
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 400,
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 28,
        stiffness: 300,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0,
      y: '100%',
      transition: {
        type: "spring",
        damping: 35,
        stiffness: 400
      }
    }
  }
};

const overlayVariants = {
  hidden: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const contentVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.2
    }
  },
  exit: { 
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

const springConfig = {
  type: "spring",
  damping: 25,
  stiffness: 300
};

// File type definitions and preview providers
const PREVIEW_PROVIDERS = {
  GOOGLE: 'https://docs.google.com/viewer',
  OFFICE: 'https://view.officeapps.live.com/op/embed.aspx',
  PDF: 'https://mozilla.github.io/pdf.js/web/viewer.html'
} as const;

const FILE_TYPES = {
  DOCUMENT: {
    WORD: ['doc', 'docx', 'rtf'],
    EXCEL: ['xls', 'xlsx', 'csv'],
    POWERPOINT: ['ppt', 'pptx'],
    PDF: ['pdf'],
    TEXT: ['txt', 'md', 'json', 'log', 'xml', 'csv', 'html']
  },
  MEDIA: {
    IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'],
    VIDEO: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'm4v'],
    AUDIO: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']
  }
} as const;

const PREVIEW_TIMEOUT = 10000; // 10 seconds
const MAX_TEXT_FILE_SIZE = 1024 * 1024; // 1MB

export function StudyMaterialDetailsModal({ material, isOpen, onClose }: StudyMaterialDetailsModalProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileStates, setFileStates] = useState<{ [key: string]: { 
    isDownloading: boolean;
    downloadProgress: number;
    error: string | null;
  } }>({});
  const [iframeLoading, setIframeLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Add touch handling for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;
    if (isDownSwipe) {
      onClose();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewTitle('');
  }, []);

  // Initialize file states
  useEffect(() => {
    if (material.fileUrls) {
      const initialStates = material.fileUrls.reduce((acc, url) => ({
        ...acc,
        [url]: { isDownloading: false, downloadProgress: 0, error: null }
      }), {});
      setFileStates(initialStates);
    }
  }, [material.fileUrls]);

  // Memoize the preview URL transformation
  const getFileType = useCallback((url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    // Check document types
    if (FILE_TYPES.DOCUMENT.WORD.includes(extension)) return 'word';
    if (FILE_TYPES.DOCUMENT.EXCEL.includes(extension)) return 'excel';
    if (FILE_TYPES.DOCUMENT.POWERPOINT.includes(extension)) return 'powerpoint';
    if (FILE_TYPES.DOCUMENT.PDF.includes(extension)) return 'pdf';
    if (FILE_TYPES.DOCUMENT.TEXT.includes(extension)) return 'text';
    
    // Check media types
    if (FILE_TYPES.MEDIA.IMAGE.includes(extension)) return 'image';
    if (FILE_TYPES.MEDIA.VIDEO.includes(extension)) return 'video';
    if (FILE_TYPES.MEDIA.AUDIO.includes(extension)) return 'audio';
    
    return 'other';
  }, []);

  const getPreviewUrl = useCallback((url: string, fileType: string): string => {
    try {
      const encodedUrl = encodeURIComponent(url);
      
      switch (fileType) {
        case 'pdf':
          // For PDFs, use Google Docs viewer as fallback if direct viewing fails
          return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
        case 'word':
          return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
        case 'excel':
          return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
        case 'powerpoint':
          return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
        case 'text':
          if (url.toLowerCase().endsWith('.csv')) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
          }
          return url;
        default:
          return url;
      }
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return url;
    }
  }, []);

  // Add loading timeout handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (iframeLoading) {
      timeoutId = setTimeout(() => {
        setIframeLoading(false);
        setPreviewError('Preview timed out. Please try opening in a new tab.');
      }, PREVIEW_TIMEOUT); // 10 seconds timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [iframeLoading]);

  const handlePreview = useCallback(async (url: string, index: number) => {
    try {
      setIsLoading(true);
      setPreviewError(null);
      const fileType = getFileType(url);
      const fileName = material.originalFileNames?.[index] || url.split('/').pop() || '';
      
      console.log('Preview requested:', { fileType, fileName, url });

      // Handle text files first
      if (fileType === 'text') {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Failed to fetch text content');
          
          // Check file size
          const contentLength = response.headers.get('content-length');
          if (contentLength && parseInt(contentLength) > MAX_TEXT_FILE_SIZE) {
            throw new Error('File is too large for preview');
          }

          const text = await response.text();
          setPreviewUrl(text);
          setPreviewType(fileType);
          setPreviewTitle(fileName);
          setIsPreviewOpen(true);
          return;
        } catch (error) {
          console.error('Text preview error:', error);
          setPreviewError('Failed to load text content. Try opening in new tab.');
          window.open(url, '_blank');
          return;
        }
      }

      // Handle document previews
      if (['pdf', 'word', 'excel', 'powerpoint'].includes(fileType)) {
        setIframeLoading(true);
        const previewUrl = getPreviewUrl(url, fileType);
        
        // For PDFs, prefer direct viewing if supported
        if (fileType === 'pdf') {
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok) throw new Error('PDF not accessible');
            
            setPreviewUrl(previewUrl);
            setPreviewType(fileType);
            setPreviewTitle(fileName);
            setIsPreviewOpen(true);
            
            // Set timeout for loading
            const timeoutId = setTimeout(() => {
              if (iframeLoading) {
                console.log('PDF preview timed out');
                setIframeLoading(false);
                setPreviewError('Preview timed out. Try opening in new tab.');
                window.open(url, '_blank');
              }
            }, PREVIEW_TIMEOUT);
            
            return () => clearTimeout(timeoutId);
          } catch (error) {
            console.error('PDF preview error:', error);
            window.open(url, '_blank');
            return;
          }
        }

        console.log('Using preview URL:', previewUrl);
        setPreviewUrl(previewUrl);
        setPreviewType(fileType);
        setPreviewTitle(fileName);
        setIsPreviewOpen(true);

        // Set timeout for document preview loading
        const timeoutId = setTimeout(() => {
          if (iframeLoading) {
            console.log('Document preview timed out');
            setIframeLoading(false);
            setPreviewError('Preview timed out. Try opening in new tab.');
            window.open(url, '_blank');
          }
        }, PREVIEW_TIMEOUT);

        return () => clearTimeout(timeoutId);
      }

      // Handle media files
      if (['image', 'video', 'audio'].includes(fileType)) {
        setPreviewType(fileType);
        setPreviewUrl(url);
        setPreviewTitle(fileName);
        setIsPreviewOpen(true);
        return;
      }

      // For unsupported files
      console.log('Unsupported file type:', fileType);
      setPreviewError('Preview not available for this file type');
      window.open(url, '_blank');

    } catch (error) {
      console.error('Preview error:', error);
      setPreviewError('Failed to load preview. Try opening in new tab.');
      window.open(url, '_blank');
    } finally {
      setIsLoading(false);
      setIframeLoading(false);
    }
  }, [getFileType, getPreviewUrl, material.originalFileNames, iframeLoading]);

  const handleIframeLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    console.log('Iframe loaded');
    const iframe = event.target as HTMLIFrameElement;
    
    // Check if the iframe loaded successfully
    try {
      // Try to access iframe content to check if it loaded properly
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.log('Cannot access iframe content - possible CORS issue');
      }
      
      setIframeLoading(false);
    } catch (error) {
      console.error('Iframe load error:', error);
      // If we can't access the iframe content but got a load event, assume it loaded
      setIframeLoading(false);
    }
  }, []);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setPreviewType(null);
      setPreviewTitle('');
      setIsPreviewOpen(false);
      setIsLoading(false);
      setIframeLoading(true);
      setPreviewError(null);
    }
  }, [isOpen]);

  // Clean up blob URLs when preview closes
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = (url: string, index: number) => {
    const fileName = material.originalFileNames?.[index] || url.split('/').pop();
    try {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName || '';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
          console.error('Error downloading file:', error);
          // Fallback to direct download
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName || '';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    } catch (error) {
      console.error('Error in download:', error);
      window.open(url, '_blank');
    }
  };

  const renderPreview = useCallback(() => {
    if (!previewUrl || !previewType) return null;

    const commonImageVideoClasses = isMobile 
      ? "w-full h-full object-contain" 
      : "max-h-[85vh] max-w-full object-contain";

    switch (previewType) {
      case 'pdf':
      case 'word':
      case 'excel':
      case 'powerpoint':
        return (
          <div className={`absolute inset-0 bg-white ${isMobile ? 'top-0 h-screen' : ''}`}>
            <iframe
              src={previewUrl}
              title={previewTitle}
              className={`w-full h-full ${isMobile ? 'absolute inset-0' : ''}`}
              style={{ border: 'none', display: 'block' }}
              onLoad={() => setIframeLoading(false)}
              onError={() => {
                setPreviewError('Failed to load document');
                setIframeLoading(false);
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
            />
          </div>
        );

      case 'image':
        return (
          <div className={`absolute inset-0 flex items-center justify-center bg-black ${isMobile ? 'top-0' : ''}`}>
            <img
              src={previewUrl}
              alt={previewTitle}
              className={`${isMobile ? 'w-full h-full object-contain' : commonImageVideoClasses}`}
              onLoad={() => setIframeLoading(false)}
              onError={() => {
                setPreviewError('Failed to load image');
                setIframeLoading(false);
              }}
              draggable={false}
            />
          </div>
        );

      case 'video':
        return (
          <div className={`absolute inset-0 flex items-center justify-center bg-black ${isMobile ? 'top-0' : ''}`}>
            <div className={`${isMobile ? 'w-full h-full' : 'max-w-4xl w-full'}`}>
              <video
                src={previewUrl}
                controls
                autoPlay
                playsInline
                className={`${isMobile ? 'w-full h-full object-contain' : commonImageVideoClasses}`}
                onLoadedData={() => setIframeLoading(false)}
                onError={() => {
                  setPreviewError('Failed to load video');
                  setIframeLoading(false);
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className={`h-full w-full flex items-center justify-center bg-gradient-to-b from-black/90 to-black/70 ${isMobile ? 'p-4' : 'p-8'}`}>
            <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-2xl'} bg-white/5 rounded-xl p-6 sm:p-8 backdrop-blur-md border border-white/10 shadow-2xl`}>
              <div className="flex items-center justify-center mb-6">
                <Music className="w-12 h-12 sm:w-16 sm:h-16 text-white/40" />
              </div>
              <h3 className="text-white text-center mb-6 text-base sm:text-lg font-medium truncate">
                {previewTitle}
              </h3>
              <audio
                src={previewUrl}
                controls
                autoPlay
                className="w-full"
                onLoadedData={() => setIframeLoading(false)}
                onError={() => {
                  setPreviewError('Failed to load audio');
                  setIframeLoading(false);
                }}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`h-full w-full overflow-auto bg-gray-900 ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className={`${isMobile ? 'w-full' : 'max-w-4xl mx-auto'}`}>
              <pre className="text-gray-100 font-mono text-sm whitespace-pre-wrap p-4 sm:p-6 rounded-lg bg-black/20 border border-white/10">
                {previewUrl}
              </pre>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full w-full flex items-center justify-center bg-black/90 p-4 sm:p-8">
            <div className="text-center text-white">
              <File className="w-12 h-12 sm:w-16 sm:h-16 text-white/40 mx-auto mb-4" />
              <p className="text-lg sm:text-xl mb-4">Preview not available</p>
              <button
                onClick={() => window.open(previewUrl, '_blank')}
                className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>
        );
    }
  }, [previewUrl, previewType, previewTitle, setIframeLoading, setPreviewError, isMobile]);

  if (!isOpen) return null;

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
      case 'xls':
      case 'xlsx':
        return <File className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <Image className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
      case 'mp4':
      case 'webm':
      case 'mov':
        return <Video className="w-5 h-5 text-pink-500 dark:text-pink-400" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <Music className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
      default:
        return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getFileSize = (url: string) => {
    // This is a placeholder. In a real app, you'd get the actual file size
    return '2.5 MB';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'task':
        return <FileText className="w-5 h-5" />;
      case 'presentation':
      case 'class slide':
      case 'slide':
        return <Presentation className="w-5 h-5" />;
      case 'lab report':
        return <Beaker className="w-5 h-5" />;
      case 'lab final':
        return <Microscope className="w-5 h-5" />;
      case 'lab performance':
        return <Activity className="w-5 h-5" />;
      case 'blc':
        return <Building className="w-5 h-5" />;
      case 'groups':
        return <Users className="w-5 h-5" />;
      case 'midterm':
      case 'final exam':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Book className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[40] overflow-hidden">
          <motion.div
            className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <motion.div
              className={`${
                isMobile
                  ? 'fixed inset-x-0 bottom-0 rounded-t-[20px] max-h-[90vh] pb-[60px]'
                  : 'relative w-[90%] max-w-3xl rounded-2xl'
              } bg-white shadow-2xl overflow-hidden`}
              style={{
                maxHeight: isMobile ? undefined : '85vh'
              }}
              variants={isMobile ? modalVariants.mobile : modalVariants.desktop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile drag indicator */}
              {isMobile && (
                <motion.div 
                  className="w-full flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10"
                  variants={contentVariants}
                >
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </motion.div>
              )}

              {/* Header */}
              <motion.div 
                className="flex items-start justify-between p-4 border-b sticky top-0 bg-white z-10"
                variants={contentVariants}
              >
                <div className="flex-1 pr-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                    {material.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {material.description}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </motion.div>

              {/* Content */}
              <motion.div 
                className="overflow-y-auto overscroll-contain p-4 space-y-4 pb-safe"
                variants={contentVariants}
                style={{ 
                  maxHeight: isMobile ? 'calc(90vh - 150px - 60px)' : 'calc(85vh - 150px)',
                  paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 80px)' : '1rem'
                }}
              >
                {/* Material details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">Created: {new Date(material.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">Duration: {material.duration || 'Not specified'}</span>
                    </div>
                    {material.tags && material.tags.length > 0 && (
                      <div className="flex items-start space-x-2 text-gray-700">
                        <Tag className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        <div className="flex flex-wrap gap-2">
                          {material.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Files section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Attached Files</h3>
                  <div className="space-y-3">
                    {material.fileUrls?.map((url, index) => {
                      const fileName = material.originalFileNames?.[index] || url.split('/').pop();
                      const fileState = fileStates[url] || { isDownloading: false, downloadProgress: 0, error: null };
                      
                      return (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                {getFileIcon(url)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {fileName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {getFileType(url).toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <button
                                onClick={() => handlePreview(url, index)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDownload(url, index)}
                                disabled={fileState.isDownloading}
                                className={`p-2 ${
                                  fileState.isDownloading
                                    ? 'text-gray-400'
                                    : 'text-blue-600 hover:bg-blue-50'
                                } rounded-lg transition-colors`}
                                title="Download"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          {fileState.isDownloading && (
                            <div className="mt-2">
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                  style={{ width: `${fileState.downloadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {fileState.error && (
                            <p className="mt-2 text-sm text-red-600">
                              {fileState.error}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Preview Modal */}
              {isPreviewOpen && (
                <motion.div
                  className={`fixed inset-0 z-[10000] bg-black ${
                    isMobile
                      ? 'h-screen w-screen overflow-hidden'
                      : ''
                  }`}
                  variants={isMobile ? modalVariants.mobile : modalVariants.desktop}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Preview Header */}
                  <div className={`
                    ${isMobile ? 'fixed top-0 left-0 right-0 z-[60]' : 'relative'}
                    flex items-center justify-between px-4 py-3
                    bg-gradient-to-b from-black/90 via-black/50 to-transparent
                  `}>
                    <div className="flex items-center space-x-3 min-w-0">
                      {getFileIcon(previewUrl || '')}
                      <h3 className="text-base font-semibold text-white truncate">
                        {previewTitle}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(previewUrl, '_blank')}
                        className="p-2 rounded-lg bg-black/40 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsPreviewOpen(false);
                          setPreviewError(null);
                          setIframeLoading(false);
                        }}
                        className="p-2 rounded-lg bg-black/40 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                        title="Close preview"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className={`absolute inset-0 ${isMobile ? 'h-screen w-screen' : ''}`}>
                    {iframeLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                        <div className="w-16 h-16 relative">
                          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-white/80 mt-4">Loading preview...</p>
                      </div>
                    )}

                    {previewError ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="max-w-md w-full mx-auto p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">Preview Error</h3>
                          <p className="text-white/80 mb-6">{previewError}</p>
                          <button
                            onClick={() => window.open(previewUrl, '_blank')}
                            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open in New Tab</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`absolute inset-0 ${isMobile ? 'top-0' : ''}`}>
                        {renderPreview()}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}