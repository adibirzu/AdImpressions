export interface VideoInfo {
  platform: 'youtube' | 'vimeo';
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

/**
 * Parses a YouTube or Vimeo URL and extracts video information
 * @param url - The video URL to parse
 * @returns VideoInfo object or null if URL is invalid
 */
export function parseVideoUrl(url: string): VideoInfo | null {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];

  // Try to match YouTube
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        platform: 'youtube',
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    }
  }

  // Try to match Vimeo
  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        platform: 'vimeo',
        videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`
      };
    }
  }

  return null;
}

/**
 * Validates if a URL is a valid YouTube or Vimeo URL
 * @param url - The URL to validate
 * @returns boolean indicating if URL is valid
 */
export function isValidVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}

/**
 * Gets the embed URL for a video
 * @param url - The video URL
 * @returns Embed URL or null if invalid
 */
export function getEmbedUrl(url: string): string | null {
  const videoInfo = parseVideoUrl(url);
  return videoInfo ? videoInfo.embedUrl : null;
}

/**
 * Gets the thumbnail URL for a video
 * @param url - The video URL
 * @returns Thumbnail URL or null if invalid
 */
export function getThumbnailUrl(url: string): string | null {
  const videoInfo = parseVideoUrl(url);
  return videoInfo ? videoInfo.thumbnailUrl : null;
}

export default {
  parseVideoUrl,
  isValidVideoUrl,
  getEmbedUrl,
  getThumbnailUrl
};
