import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, adId, adTitle }) => {
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const shareUrl = `${window.location.origin}/ads/${adId}`;
  const embedCode = `<iframe src="${shareUrl}" width="640" height="480" frameborder="0" allowfullscreen></iframe>`;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy embed code:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-600">
          <h2 className="text-2xl font-bold text-white">Share Ad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ad Title */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{adTitle}</h3>
          </div>

          {/* Copy Link Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-dark-700 text-white px-4 py-2 rounded-lg border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button onClick={handleCopyLink} variant={copied ? 'secondary' : 'primary'}>
                {copied ? (
                  <>
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  'Copy'
                )}
              </Button>
            </div>
          </div>

          {/* QR Code Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              QR Code
            </label>
            <div className="bg-white p-4 rounded-lg inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Scan this QR code to open the ad on mobile devices
            </p>
          </div>

          {/* Embed Code Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Embed Code
            </label>
            <div className="space-y-2">
              <textarea
                value={embedCode}
                readOnly
                rows={3}
                className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg border border-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              />
              <Button
                onClick={handleCopyEmbed}
                variant={embedCopied ? 'secondary' : 'outline'}
                fullWidth
              >
                {embedCopied ? (
                  <>
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Embed Code Copied!
                  </>
                ) : (
                  'Copy Embed Code'
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Use this code to embed the ad on your website
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-dark-600">
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
