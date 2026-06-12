import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

const uploadOnCloudinary = async (localPath: string) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    if(!cloudName || !key || !secret) {
        throw new Error("Required things not found for cloudinary!")
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: key,
        api_secret: secret
    })

    try {
        if (!localPath) return null;

        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localPath)
        return response;
    } catch (error) {
        console.log("Cloudinary Upload Error ", error);
        fs.unlinkSync(localPath)
        return null
    }
}

const deleteItemOnCloudinary = async (publicId: string) => {
    try {
        if(!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId);
        
        return response;
    } catch (error) {
        console.error("Cloudinary failed to delete photo!!! Error : ", error)
        return null;
    }
}

export { uploadOnCloudinary, deleteItemOnCloudinary }