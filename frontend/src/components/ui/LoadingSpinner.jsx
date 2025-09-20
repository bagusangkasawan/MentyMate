import React from 'react';

export const LoadingSpinner = () => (
  <div className="fixed inset-0 flex justify-center items-center z-[2000]">
    <div className="w-16 h-16 border-8 border-gray-200 border-t-[#205781] rounded-full animate-spin"></div>
  </div>
);
