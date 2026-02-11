/**
 * Share Hornet Hive utility
 * Handles Web Share API with clipboard fallback
 */

export interface ShareResult {
  success: boolean;
  method: 'webshare' | 'clipboard' | 'legacy' | 'none';
  error?: string;
}

const SHARE_DATA = {
  title: 'Hornet Hive',
  text: 'Join me on Hornet Hive - a safe space for Eureka students to connect and share!',
  url: typeof window !== 'undefined' ? window.location.origin : '',
};

/**
 * Attempt to share using Web Share API
 */
async function tryWebShare(): Promise<ShareResult> {
  if (!navigator.share) {
    return { success: false, method: 'none', error: 'Web Share API not supported' };
  }

  try {
    await navigator.share(SHARE_DATA);
    return { success: true, method: 'webshare' };
  } catch (error: any) {
    // User cancelled the share dialog
    if (error.name === 'AbortError') {
      return { success: false, method: 'webshare', error: 'Share cancelled' };
    }
    return { success: false, method: 'webshare', error: error.message || 'Share failed' };
  }
}

/**
 * Fallback: Copy link to clipboard using modern API
 */
async function tryClipboardAPI(): Promise<ShareResult> {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    return { success: false, method: 'none', error: 'Clipboard API not supported' };
  }

  try {
    await navigator.clipboard.writeText(SHARE_DATA.url);
    return { success: true, method: 'clipboard' };
  } catch (error: any) {
    return { success: false, method: 'clipboard', error: error.message || 'Clipboard write failed' };
  }
}

/**
 * Legacy fallback: Copy using temporary textarea
 */
function tryLegacyCopy(): ShareResult {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = SHARE_DATA.url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (success) {
      return { success: true, method: 'legacy' };
    }
    return { success: false, method: 'legacy', error: 'Copy command failed' };
  } catch (error: any) {
    return { success: false, method: 'legacy', error: error.message || 'Legacy copy failed' };
  }
}

/**
 * Main share function with automatic fallback chain
 */
export async function shareHornetHive(): Promise<ShareResult> {
  // Try Web Share API first
  const webShareResult = await tryWebShare();
  if (webShareResult.success || webShareResult.error === 'Share cancelled') {
    return webShareResult;
  }

  // Fallback to Clipboard API
  const clipboardResult = await tryClipboardAPI();
  if (clipboardResult.success) {
    return clipboardResult;
  }

  // Final fallback to legacy method
  return tryLegacyCopy();
}

/**
 * Copy link to clipboard (for explicit copy button)
 */
export async function copyLinkToClipboard(): Promise<ShareResult> {
  // Try modern clipboard API first
  const clipboardResult = await tryClipboardAPI();
  if (clipboardResult.success) {
    return clipboardResult;
  }

  // Fallback to legacy method
  return tryLegacyCopy();
}

/**
 * Check if Web Share API is available
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}
