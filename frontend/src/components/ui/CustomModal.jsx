import React from 'react';

export const CustomModal = ({
  title,
  message,
  show,
  onClose,
  confirmText,
  cancelText,
  onConfirm,
  onCancel
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1050]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-11/12 max-w-md font-sans">
        <h3 className="text-xl font-bold mb-3 text-[#205781]">{title}</h3>
        <div
          className="mb-4 text-gray-700"
          dangerouslySetInnerHTML={{ __html: message }}
        ></div>

        <div className="flex gap-2">
          {cancelText && (
            <button
              onClick={onCancel || onClose}
              className="w-full bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              {cancelText}
            </button>
          )}
          {confirmText ? (
            <button
              onClick={onConfirm}
              className="w-full bg-[#205781] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#1a4a6e] transition-colors"
            >
              {confirmText}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-[#205781] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#1a4a6e] transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
