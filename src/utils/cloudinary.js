import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded on Cloudinary. File src:", response.secure_url);
    
    // Delete local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    // Only delete file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};


const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("deleted from Cloudinary ,PublicId", publicId);
  } catch (error) {
    console.log("Error from deleting from Cloudinary , PublicId", publicId);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
