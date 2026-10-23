import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";

const client = new ImageKit({ privateKey: config.IMAGEKIT_PRIVATE_KEY });

const FOLDER = "/attachments";   // every upload goes into this folder of your ImageKit media library

// uploads one file. "isPrivateFile" means: nobody can open it without a signed link made by our server
export async function uploadToImageKit(buffer, fileName) {
    const result = await client.files.upload({
        file: await toFile(buffer, fileName),
        fileName,
        folder: FOLDER,
        isPrivateFile: true,
    });

    return { fileId: result.fileId, filePath: result.filePath };
}

// removes a file from ImageKit. A failure is only logged, so one broken delete never blocks the rest
export async function deleteFromImageKit(fileId) {
    try {
        await client.files.delete(fileId);
    } catch (error) {
        console.error("ImageKit delete failed:", fileId, error.message);
    }
}

// a link to a private file that stops working after 5 minutes
export function getSignedUrl(filePath) {
    return client.helper.buildSrc({
        urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
        src: filePath,
        signed: true,
        expiresIn: 300,
    });
}