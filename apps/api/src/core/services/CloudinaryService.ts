import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../errors/AppError";
import { config } from "../../config/env";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  // Upload a file to cloudinary specific folder
  /**
   * @param fileBuffer - processed by sharp
   * @param folder - the folder name (avatar, medical-records)
   */
  static async uploadStream(fileBuffer: Buffer, folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `teryaq/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error)
            return reject(new AppError("Cloudinary Upload Failed", 500));
          resolve(result);
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  // Delete and image from cloudinary
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new AppError("Failed to delete old image", 500);
    }
  }
}
