import path from "path";
import multer from "multer";
import fs from "fs";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
const sliderFolder = path.resolve(publicFolder, "company1", "slider");

const ensureFolder = () => {
  if (!fs.existsSync(sliderFolder)) {
    fs.mkdirSync(sliderFolder, { recursive: true });
    fs.chmodSync(sliderFolder, 0o777);
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureFolder();
    cb(null, sliderFolder);
  },
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, "_").replace(/\/+/, "-");
    const uniqueName = `${Date.now()}_${sanitized}`;
    cb(null, uniqueName);
  }
});

export const getSliderRelativePath = (filename: string) => `company1/slider/${filename}`;

export default {
  storage
};
