import path from "path";
import fs from "fs";

const mediaLibraryRoot = path.resolve(__dirname, "..", "..", "public");

const sanitizeSegment = (value: string | number) =>
  String(value)
    .replace(/[\\/:*?"<>|]/g, "_")
    .trim();

export const getCompanyMediaFolderPath = (companyId: number, folderId: number) => {
  const sanitizedCompany = sanitizeSegment(`company${companyId}`);
  const sanitizedFolder = sanitizeSegment(folderId);

  return path.resolve(
    mediaLibraryRoot,
    sanitizedCompany,
    "media-library",
    sanitizedFolder
  );
};

export const ensureDirectory = async (dirPath: string) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

export const getRelativeStoragePath = (absolutePath: string) => {
  const relative = path.relative(mediaLibraryRoot, absolutePath);
  return relative.replace(/\\/g, "/");
};

export const deleteStoredFile = async (relativePath?: string | null) => {
  if (!relativePath) return;

  const normalized = relativePath.replace(/\\/g, "/");
  const absolutePath = path.resolve(mediaLibraryRoot, normalized);

  try {
    await fs.promises.unlink(absolutePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
};
