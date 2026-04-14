import express from "express";
import isAuth from "../middleware/isAuth";
import * as CallRecordController from "../controllers/CallRecordController";

const callRecordRoutes = express.Router();

callRecordRoutes.get("/call-records", isAuth, CallRecordController.index);
callRecordRoutes.get("/call-records/summary", isAuth, CallRecordController.summary);
callRecordRoutes.get("/call-records/:id", isAuth, CallRecordController.show);
callRecordRoutes.post("/call-records", isAuth, CallRecordController.store);
callRecordRoutes.put("/call-records/:id", isAuth, CallRecordController.update);

export default callRecordRoutes;
