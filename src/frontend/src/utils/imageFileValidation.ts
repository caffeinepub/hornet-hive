import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../constants/uploads';

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a JPEG, PNG, or WebP image.`,
    };
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
    };
  }
  
  return { valid: true };
}
