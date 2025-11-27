import React, { useState } from 'react';
import ReportModal from './ReportModal';

interface ReportButtonProps {
  adId: string;
  adTitle: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ adId, adTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-dark-700"
        aria-label="Report ad"
        title="Report this ad"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <span className="text-sm font-medium">Report</span>
      </button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        adId={adId}
        adTitle={adTitle}
      />
    </>
  );
};

export default ReportButton;
