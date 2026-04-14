import path from "path";
import multer from "multer";
import fs from "fs";
import Whatsapp from "../models/Whatsapp";
import { isEmpty, isNil } from "lodash";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

export default {
  directory: publicFolder,
  storage: multer.diskStorage({
    destination: async function (req, file, cb) {

      let companyId;
      companyId = req.user?.companyId
      const { typeArch, fileId } = req.body;

      if (companyId === undefined && isNil(companyId) && isEmpty(companyId)) {
        const authHeader = req.headers.authorization;
        const [, token] = authHeader.split(" ");
        const whatsapp = await Whatsapp.findOne({ where: { token } });
        companyId = whatsapp.companyId;
      }
      let folder;

      if (typeArch && typeArch !== "announcements" && typeArch !== "logo" && typeArch !== "terms" && typeArch !== "dashboard") {
        folder = path.resolve(publicFolder, `company${companyId}`, typeArch, fileId ? fileId : "")
      } else if (typeArch && typeArch === "announcements") {
        folder = path.resolve(publicFolder, typeArch)
      } else if (typeArch === "logo" || typeArch === "terms" || typeArch === "dashboard") {
        folder = path.resolve(publicFolder)
      }
      else {
        folder = path.resolve(publicFolder, `company${companyId}`)
      }

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true })
        fs.chmodSync(folder, 0o777)
      }
      return cb(null, folder);
    },
    filename(req, file, cb) {
      const { typeArch, mode } = req.body;

      let fileName;
      
      // Dashboard images use fixed names
      if (typeArch === "dashboard" && mode) {
        fileName = `dashboard-image-${mode}.png`;
      }
      // Announcements use timestamp
      else if (typeArch && typeArch === "announcements") {
        fileName = new Date().getTime() + '_' + file.originalname.replace('/', '-').replace(/ /g, "_");
      }
      // Others use original name
      else {
        fileName = file.originalname.replace('/', '-').replace(/ /g, "_");
      }
      
      return cb(null, fileName);
    }
  })
};
