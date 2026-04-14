import { Request, Response } from "express";
import ListServiceOrdersService from "../services/ServiceOrderService/ListServiceOrdersService";
import CreateServiceOrderService from "../services/ServiceOrderService/CreateServiceOrderService";
import ShowServiceOrderService from "../services/ServiceOrderService/ShowServiceOrderService";
import UpdateServiceOrderService from "../services/ServiceOrderService/UpdateServiceOrderService";
import DeleteServiceOrderService from "../services/ServiceOrderService/DeleteServiceOrderService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam, status, customerId, pageNumber, limit } = req.query as {
    searchParam?: string;
    status?: string;
    customerId?: string;
    pageNumber?: string;
    limit?: string;
  };

  const result = await ListServiceOrdersService({
    companyId,
    searchParam,
    status,
    customerId: customerId ? Number(customerId) : undefined,
    pageNumber: pageNumber ? Number(pageNumber) : undefined,
    limit: limit ? Number(limit) : undefined
  });

  return res.json(result);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const payload = await CreateServiceOrderService({ ...req.body, companyId });
  return res.status(201).json(payload);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { serviceOrderId } = req.params;
  const order = await ShowServiceOrderService({ companyId, orderId: Number(serviceOrderId) });
  return res.json(order);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { serviceOrderId } = req.params;
  const payload = await UpdateServiceOrderService({
    ...req.body,
    companyId,
    orderId: Number(serviceOrderId)
  });

  return res.json(payload);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { serviceOrderId } = req.params;
  await DeleteServiceOrderService({ companyId, orderId: Number(serviceOrderId) });
  return res.status(204).send();
};
