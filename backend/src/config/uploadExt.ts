import path from "path";
import multer from "multer";
import fs from "fs";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
const uploadFolder = path.join(publicFolder, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const formatFileName = (originalName: string) => {
  const extension = path.extname(originalName);
  let baseName = path.basename(originalName, extension);

  const MAX_NAME_LENGTH = 30;
  if (baseName.length > MAX_NAME_LENGTH) {
    baseName = baseName.substring(0, MAX_NAME_LENGTH);
  }
  baseName = baseName.replace(/[^a-zA-Z0-9]/g, "_");
  baseName = baseName.replace(/_+/g, "_");
  baseName = baseName.replace(/^_|_$/g, "");

  return baseName;
};

export default {
  directory: uploadFolder,

  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(req, file, cb) {
      const timestamp = new Date().getTime();
      const originalName = file.originalname;

      let extension = path.extname(originalName).toLowerCase();

      if (!extension) {
        if (file.mimetype === "application/pdf") extension = ".pdf";
        else if (file.mimetype.includes("spreadsheetml")) extension = ".xlsx";
        else if (file.mimetype.includes("wordprocessingml"))
          extension = ".docx";
        else if (file.mimetype.includes("msword")) extension = ".doc";
        else if (file.mimetype.includes("ms-excel")) extension = ".xls";
        else if (file.mimetype.includes("audio/")) extension = ".mp3";
        else if (file.mimetype.split("/")[1])
          extension = `.${file.mimetype.split("/")[1]}`;
        else extension = "";
      }

      const formattedName = formatFileName(originalName);

      const finalName = `${formattedName}_${timestamp}${extension}`;

      return cb(null, finalName);
    }
  }),
  limits: {
    fileSize: 104857600 // 100MB em bytes
  }
};
