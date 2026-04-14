import express from "express";
import multer from "multer";

import isAuth from "../middleware/isAuth";
import sliderUpload from "../config/sliderUpload";
import * as SliderHomeController from "../controllers/SliderHomeController";

const sliderHomeRoutes = express.Router();
const upload = multer(sliderUpload);

sliderHomeRoutes.use(isAuth);

sliderHomeRoutes.get("/slider-home", SliderHomeController.index);
sliderHomeRoutes.get("/slider-home/:sliderId", SliderHomeController.show);
sliderHomeRoutes.post("/slider-home", upload.single("image"), SliderHomeController.store);
sliderHomeRoutes.put("/slider-home/:sliderId", upload.single("image"), SliderHomeController.update);
sliderHomeRoutes.delete("/slider-home/:sliderId", SliderHomeController.remove);

export default sliderHomeRoutes;
