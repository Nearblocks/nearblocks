import Image from 'next/image';
import React, { useEffect } from 'react';
type ImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
};

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
}) => {
  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    } else {
      window.removeEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className="relative">
        <button
          className="absolute top-0 right-0 m-2 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <Image
          src={imageSrc}
          alt="Modal Content"
          width={900}
          height={900}
          className="max-w-full max-h-full"
        />
      </div>
    </div>
  );
};

export default ImageModal;
