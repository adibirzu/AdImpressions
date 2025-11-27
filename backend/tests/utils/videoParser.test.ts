import {
  parseVideoUrl,
  isValidVideoUrl,
  getEmbedUrl,
  getThumbnailUrl
} from '../../src/utils/videoParser';

describe('videoParser', () => {
  describe('parseVideoUrl', () => {
    describe('YouTube URLs', () => {
      it('should parse standard YouTube watch URL', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
        expect(result?.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
        expect(result?.thumbnailUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
      });

      it('should parse YouTube shortened URL (youtu.be)', () => {
        const url = 'https://youtu.be/dQw4w9WgXcQ';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
      });

      it('should parse YouTube embed URL', () => {
        const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
      });

      it('should parse YouTube URL with additional query parameters', () => {
        const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLxyz';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
      });

      it('should parse YouTube URL without www', () => {
        const url = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
      });

      it('should parse YouTube URL with http protocol', () => {
        const url = 'http://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
      });

      it('should handle YouTube video IDs with hyphens and underscores', () => {
        const url = 'https://www.youtube.com/watch?v=ABC-123_xyz';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.videoId).toBe('ABC-123_xyz');
      });
    });

    describe('Vimeo URLs', () => {
      it('should parse standard Vimeo URL', () => {
        const url = 'https://vimeo.com/123456789';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('vimeo');
        expect(result?.videoId).toBe('123456789');
        expect(result?.embedUrl).toBe('https://player.vimeo.com/video/123456789');
        expect(result?.thumbnailUrl).toBe('https://vumbnail.com/123456789.jpg');
      });

      it('should parse Vimeo player URL', () => {
        const url = 'https://player.vimeo.com/video/123456789';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('vimeo');
        expect(result?.videoId).toBe('123456789');
      });

      it('should parse Vimeo URL without www', () => {
        const url = 'https://vimeo.com/987654321';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('vimeo');
        expect(result?.videoId).toBe('987654321');
      });

      it('should parse Vimeo URL with http protocol', () => {
        const url = 'http://vimeo.com/123456789';
        const result = parseVideoUrl(url);

        expect(result).not.toBeNull();
        expect(result?.platform).toBe('vimeo');
        expect(result?.videoId).toBe('123456789');
      });
    });

    describe('Invalid URLs', () => {
      it('should return null for invalid URL', () => {
        const url = 'https://example.com/video';
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });

      it('should return null for Dailymotion URL', () => {
        const url = 'https://www.dailymotion.com/video/x123456';
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });

      it('should return null for empty string', () => {
        const url = '';
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });

      it('should return null for malformed YouTube URL', () => {
        const url = 'https://www.youtube.com/watch';
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });

      it('should return null for YouTube URL with invalid video ID format', () => {
        const url = 'https://www.youtube.com/watch?v=abc'; // Too short
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });

      it('should return null for Vimeo URL without video ID', () => {
        const url = 'https://vimeo.com/';
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });

      it('should return null for non-video URL', () => {
        const url = 'https://www.google.com';
        const result = parseVideoUrl(url);

        expect(result).toBeNull();
      });
    });
  });

  describe('isValidVideoUrl', () => {
    it('should return true for valid YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(isValidVideoUrl(url)).toBe(true);
    });

    it('should return true for valid Vimeo URL', () => {
      const url = 'https://vimeo.com/123456789';
      expect(isValidVideoUrl(url)).toBe(true);
    });

    it('should return false for invalid URL', () => {
      const url = 'https://example.com/video';
      expect(isValidVideoUrl(url)).toBe(false);
    });

    it('should return false for empty string', () => {
      const url = '';
      expect(isValidVideoUrl(url)).toBe(false);
    });

    it('should return false for null-like values', () => {
      expect(isValidVideoUrl('null')).toBe(false);
      expect(isValidVideoUrl('undefined')).toBe(false);
    });
  });

  describe('getEmbedUrl', () => {
    it('should return YouTube embed URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const embedUrl = getEmbedUrl(url);

      expect(embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should return Vimeo embed URL', () => {
      const url = 'https://vimeo.com/123456789';
      const embedUrl = getEmbedUrl(url);

      expect(embedUrl).toBe('https://player.vimeo.com/video/123456789');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      const embedUrl = getEmbedUrl(url);

      expect(embedUrl).toBeNull();
    });

    it('should return same embed URL for already embedded YouTube URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const embedUrl = getEmbedUrl(url);

      expect(embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should return same embed URL for already embedded Vimeo URL', () => {
      const url = 'https://player.vimeo.com/video/123456789';
      const embedUrl = getEmbedUrl(url);

      expect(embedUrl).toBe('https://player.vimeo.com/video/123456789');
    });
  });

  describe('getThumbnailUrl', () => {
    it('should return YouTube thumbnail URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const thumbnailUrl = getThumbnailUrl(url);

      expect(thumbnailUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
    });

    it('should return Vimeo thumbnail URL', () => {
      const url = 'https://vimeo.com/123456789';
      const thumbnailUrl = getThumbnailUrl(url);

      expect(thumbnailUrl).toBe('https://vumbnail.com/123456789.jpg');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/video';
      const thumbnailUrl = getThumbnailUrl(url);

      expect(thumbnailUrl).toBeNull();
    });

    it('should return thumbnail for shortened YouTube URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const thumbnailUrl = getThumbnailUrl(url);

      expect(thumbnailUrl).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');
    });
  });

  describe('Edge cases', () => {
    it('should handle URLs with trailing slashes', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ/';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should handle URLs with fragments', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ#t=42';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should handle mixed case in domain', () => {
      const url = 'https://www.YouTube.com/watch?v=dQw4w9WgXcQ';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should handle Vimeo URLs with trailing content', () => {
      const url = 'https://vimeo.com/123456789/abc123def';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.videoId).toBe('123456789');
    });
  });

  describe('Real-world examples', () => {
    it('should parse actual YouTube video URL', () => {
      const url = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('youtube');
      expect(result?.videoId).toBe('jNQXAC9IVRw');
    });

    it('should parse YouTube mobile URL', () => {
      const url = 'https://m.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('youtube');
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
    });

    it('should parse YouTube shared URL from mobile', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ?si=abc123';
      const result = parseVideoUrl(url);

      expect(result).not.toBeNull();
      expect(result?.platform).toBe('youtube');
      expect(result?.videoId).toBe('dQw4w9WgXcQ');
    });
  });
});
