import multer from "multer";
import path from "path";
export const PDF_TYPE = "application/pdf";

export const MAX_FILES = 3;                       // also the most images the vision model accepts at once
export const MAX_FILE_SIZE = 10 * 1024 * 1024;    // 10 MB

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".html", ".css"];

const upload = multer({
    storage: multer.memoryStorage(),   // the file waits in memory just long enough to be sent to ImageKit
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowed = IMAGE_TYPES.includes(file.mimetype) ||
            (file.mimetype === PDF_TYPE && extension === ".pdf") ||   // a PDF needs both the type and the name
            TEXT_EXTENSIONS.includes(extension);
        if (!allowed) return cb(new Error(`"${file.originalname}" is not a supported file type`));
        cb(null, true);
    },
}).array("files", MAX_FILES);

// multer reports problems (too big, too many files) as errors. Turn them into a normal JSON answer.
export function uploadFiles(req, res, next) {
    upload(req, res, (error) => {
        if (!error) return next();

        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Each file must be 10 MB or smaller"
            : error.code === "LIMIT_UNEXPECTED_FILE"
                ? `You can attach at most ${MAX_FILES} files`
                : error.message;

        return res.status(400).json({ message, success: false });
    });
}