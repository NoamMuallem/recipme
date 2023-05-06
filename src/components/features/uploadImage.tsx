// UploadImage.tsx
import React, { type ChangeEvent, type FC } from "react";

type UploadImageProps = {
  onImageUploaded: (base64Image: string) => void;
};

const UploadImage: FC<UploadImageProps> = ({ onImageUploaded }) => {
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          onImageUploaded(e.target.result as string);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  return (
    <label className="btn-primary btn">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      Upload Image
    </label>
  );
};

export default UploadImage;
