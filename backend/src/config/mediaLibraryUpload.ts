import multer from "multer";
import {
  ensureDirectory,
  getCompanyMediaFolderPath
} from "../utils/mediaLibraryPaths";

const sanitizeFileName = (value: string) =>
  value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const companyId = req.user?.companyId;
    const folderId = Number(req.params?.folderId);

    if (!companyId || !folderId) {
      return cb(new Error("Informações da pasta inválidas."), "");
    }

    const targetPath = getCompanyMediaFolderPath(companyId, folderId);

    ensureDirectory(targetPath)
      .then(() => cb(null, targetPath))
      .catch(err => cb(err as Error, ""));
  },
  filename: (req, file, cb) => {
    const base = sanitizeFileName(file.originalname);
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${base}`);
  }
});

export default {
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
};
