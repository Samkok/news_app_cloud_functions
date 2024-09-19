import {UploadImageOptions} from "../models/image_model";
import {bucket} from "../config";
import * as path from "path";
import {v4 as uuidv4} from "uuid";

export const uploadImageService = async ({filePath, collection, id}: UploadImageOptions) : Promise<string> => {
  try {
    const extension = path.extname(filePath); // Get file extension (.png, .jpg, etc.)
    const fileName = `${id}_${uuidv4()}${extension}`; // Generate unique file name using userId and UUID

    // Reference to the file in Firebase Storage
    const fileRef = bucket.file(`${collection}/${id}/${fileName}`);

    // Upload the file
    await bucket.upload(filePath, {
      destination: fileRef,
      metadata: {
        contentType: `image/${extension.replace(".", "")}`, // Set content type dynamically based on the file extension
      },
    });

    // Get the download URL
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set expiration far in the future
    });

    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    return "";
  }
};
