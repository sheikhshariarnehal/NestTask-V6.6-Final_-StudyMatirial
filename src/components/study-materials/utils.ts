import { FileText, File, Presentation, Image, Video, Music, Archive } from 'lucide-react';

// File type definitions
const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  VIDEO: ['mp4', 'webm', 'mov', 'avi'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a'],
  WORD: ['doc', 'docx'],
  EXCEL: ['xls', 'xlsx', 'csv'],
  POWERPOINT: ['ppt', 'pptx'],
  PDF: ['pdf'],
  TEXT: ['txt', 'rtf', 'md']
} as const;

export function getFileIcon(url: string) {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (!extension) return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />;

  // Word Documents
  if (FILE_TYPES.WORD.includes(extension)) {
    return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
  }
  
  // Excel Spreadsheets
  if (FILE_TYPES.EXCEL.includes(extension)) {
    return <File className="w-5 h-5 text-green-500 dark:text-green-400" />;
  }
  
  // PowerPoint Presentations
  if (FILE_TYPES.POWERPOINT.includes(extension)) {
    return <Presentation className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  }
  
  // PDF Files
  if (FILE_TYPES.PDF.includes(extension)) {
    return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
  }
  
  // Images
  if (FILE_TYPES.IMAGE.includes(extension)) {
    return <Image className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
  }
  
  // Videos
  if (FILE_TYPES.VIDEO.includes(extension)) {
    return <Video className="w-5 h-5 text-pink-500 dark:text-pink-400" />;
  }
  
  // Audio Files
  if (FILE_TYPES.AUDIO.includes(extension)) {
    return <Music className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
  }
  
  // Archives
  if (['zip', 'rar', '7z'].includes(extension)) {
    return <Archive className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
  }
  
  // Default
  return <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
}

export function getFileType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'other';

  if (FILE_TYPES.IMAGE.includes(extension)) return 'image';
  if (FILE_TYPES.VIDEO.includes(extension)) return 'video';
  if (FILE_TYPES.AUDIO.includes(extension)) return 'audio';
  if (FILE_TYPES.PDF.includes(extension)) return 'pdf';
  if (FILE_TYPES.WORD.includes(extension)) return 'word';
  if (FILE_TYPES.EXCEL.includes(extension)) return 'excel';
  if (FILE_TYPES.POWERPOINT.includes(extension)) return 'powerpoint';
  if (FILE_TYPES.TEXT.includes(extension)) return 'text';
  
  return 'other';
}

export function getFileSize(url: string) {
  // This is a placeholder. In a real app, you'd get the actual file size
  return '2.5 MB';
}

export function getFileExtension(url: string): string {
  return url.split('.').pop()?.toLowerCase() || '';
}

export function isOfficeDocument(extension: string): boolean {
  return [
    ...FILE_TYPES.WORD,
    ...FILE_TYPES.EXCEL,
    ...FILE_TYPES.POWERPOINT,
    ...FILE_TYPES.PDF
  ].includes(extension);
}

export function getPreviewProvider(extension: string): 'office' | 'google' | 'native' {
  if ([...FILE_TYPES.WORD, ...FILE_TYPES.POWERPOINT].includes(extension)) {
    return 'office';
  }
  
  if ([...FILE_TYPES.PDF, ...FILE_TYPES.EXCEL].includes(extension)) {
    return 'google';
  }
  
  return 'native';
} 