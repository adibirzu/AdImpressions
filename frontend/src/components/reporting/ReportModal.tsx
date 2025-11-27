import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { reportingService, ReportReason } from '../../services/reportingService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, adId, adTitle }) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const reasons: { value: ReportReason; label: string; description: string }[] = [
    {
      value: 'inappropriate',
      label: 'Inappropriate Content',
      description: 'Contains offensive or inappropriate material'
    },
    {
      value: 'misleading',
      label: 'Misleading',
      description: 'Contains false or misleading information'
    },
    {
      value: 'spam',
      label: 'Spam',
      description: 'Promotional content or spam'
    },
    {
      value: 'copyright',
      label: 'Copyright Violation',
      description: 'Infringes on copyright or intellectual property'
    },
    {
      value: 'other',
      label: 'Other',
      description: 'Other concerns not listed above'
    }
  ];

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

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedReason('');
      setDescription('');
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setErrorMessage('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await reportingService.createReport(adId, selectedReason, description);
      setSubmitStatus('success');

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Report Ad</h2>
          </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="text-green-500 font-semibold">Report Submitted</h3>
                <p className="text-green-400 text-sm mt-1">
                  Thank you for your report. We will review it and take appropriate action.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-500 font-semibold">Error</h3>
                <p className="text-red-400 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {submitStatus !== 'success' && (
            <>
              {/* Ad Title */}
              <div>
                <h3 className="text-white font-medium mb-2">Reporting:</h3>
                <p className="text-gray-300">{adTitle}</p>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Reason for Report <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {reasons.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedReason === reason.value
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-dark-600 hover:border-dark-500 bg-dark-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value as ReportReason)}
                        className="mt-1 w-4 h-4 text-red-500 border-dark-500 focus:ring-red-500 focus:ring-offset-dark-800"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{reason.label}</div>
                        <div className="text-sm text-gray-400 mt-1">{reason.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-dark-700 text-white px-4 py-3 rounded-lg border border-dark-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Please provide any additional information that might help us review this report..."
                  maxLength={500}
                />
                <div className="text-sm text-gray-500 mt-1 text-right">
                  {description.length}/500
                </div>
              </div>

              {/* Note */}
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold text-white mb-1">What happens next?</p>
                    <p>
                      Our team will review your report and take appropriate action. False reports may result in
                      restrictions on your account.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          {submitStatus !== 'success' && (
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
              <Button onClick={onClose} variant="ghost" type="button">
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={isSubmitting}>
                Submit Report
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
