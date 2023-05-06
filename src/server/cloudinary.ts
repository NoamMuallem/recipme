import { env } from "y/env.mjs";
import cloudinary from "cloudinary";

// Configuration
cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadBase64 = async (image: string) => {
  const res = await cloudinary.v2.uploader.upload(image);
  return res.secure_url;
};
