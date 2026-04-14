import express from "express";
import isAuth from "../middleware/isAuth";
import tokenAuth from "../middleware/tokenAuth";
import * as QueueOptionController from "../controllers/QueueOptionController";
import * as InvoicesController from "../controllers/InvoicesController";
const invoiceRoutes = express.Router();
invoiceRoutes.get("/invoices", isAuth, InvoicesController.index);
invoiceRoutes.get("/invoices/list", InvoicesController.list);
invoiceRoutes.get("/invoices/all", isAuth, InvoicesController.list);
invoiceRoutes.get("/invoices/:Invoiceid", isAuth, InvoicesController.show);
invoiceRoutes.put("/invoices/:id", isAuth, InvoicesController.update);
invoiceRoutes.post("/invoices/pay", isAuth, InvoicesController.pay);
invoiceRoutes.post("/invoices/:id/admin-pay", isAuth, InvoicesController.adminManualPay);
invoiceRoutes.post("/invoices/:id/send-billing", isAuth, InvoicesController.sendBillingNotification);

//external


export default invoiceRoutes;
