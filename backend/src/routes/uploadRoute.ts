import { Router } from "express";
import multer from "multer";
import path from "path";

const uploadRouter = Router();

// Configuração do multer para salvar na pasta /backend/public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Criar a rota para upload
uploadRouter.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "Nenhum arquivo enviado." });
  }

  const filePath = `/uploads/${req.file.filename}`;
  return res.json({ success: true, filePath });
});

export default uploadRouter;
