import { Request, Response } from "express";
import { Op } from "sequelize";
import CallRecord from "../models/CallRecord";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import User from "../models/User";

type IndexQuery = {
  pageNumber?: string;
  status?: string;
  dateStart?: string;
  dateEnd?: string;
  contactNumber?: string;
  whatsappId?: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const { contactId, whatsappId, ticketId, toNumber } = req.body;

  try {
    const callRecord = await CallRecord.create({
      callId: `out-${Date.now()}`,
      type: "outgoing",
      status: "answered",
      fromNumber: "",
      toNumber: toNumber || "",
      duration: 0,
      contactId: contactId || null,
      whatsappId: whatsappId || null,
      ticketId: ticketId || null,
      userId,
      companyId,
      callStartedAt: new Date(),
    });

    return res.status(201).json(callRecord);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao registrar chamada" });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { status, duration } = req.body;

  try {
    const record = await CallRecord.findOne({ where: { id, companyId } });
    if (!record) return res.status(404).json({ error: "Registro não encontrado" });

    await record.update({
      status: status || record.status,
      duration: duration || record.duration,
      callEndedAt: new Date(),
    });

    return res.json(record);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar chamada" });
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;
  const {
    pageNumber = "1",
    status,
    dateStart,
    dateEnd,
    contactNumber,
    whatsappId
  } = req.query as IndexQuery;

  const limit = 40;
  const offset = limit * (Number(pageNumber) - 1);

  const where: any = { companyId };

  // Usuário comum só vê suas próprias chamadas
  if (profile !== "admin") {
    where.userId = userId;
  }

  if (status) {
    where.status = status;
  }

  if (dateStart && dateEnd) {
    where.createdAt = {
      [Op.between]: [new Date(`${dateStart}T00:00:00`), new Date(`${dateEnd}T23:59:59`)]
    };
  } else if (dateStart) {
    where.createdAt = {
      [Op.gte]: new Date(`${dateStart}T00:00:00`)
    };
  }

  if (contactNumber) {
    where.fromNumber = { [Op.like]: `%${contactNumber}%` };
  }

  if (whatsappId) {
    where.whatsappId = Number(whatsappId);
  }

  // Não mostrar registros com status "ringing" (chamadas em andamento)
  if (!status) {
    where.status = { [Op.ne]: "ringing" };
  }

  const { count, rows: records } = await CallRecord.findAndCountAll({
    where,
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });

  const hasMore = count > offset + records.length;

  return res.json({ records, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const record = await CallRecord.findOne({
    where: { id, companyId },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!record) {
    return res.status(404).json({ error: "Call record not found" });
  }

  return res.json(record);
};

export const summary = async (req: Request, res: Response): Promise<Response> => {
  const { companyId, id: userId, profile } = req.user;
  const { dateStart, dateEnd } = req.query as { dateStart?: string; dateEnd?: string };

  const where: any = {
    companyId,
    status: { [Op.ne]: "ringing" }
  };

  // Usuário comum só vê resumo das suas próprias chamadas
  if (profile !== "admin") {
    where.userId = userId;
  }

  if (dateStart && dateEnd) {
    where.createdAt = {
      [Op.between]: [new Date(`${dateStart}T00:00:00`), new Date(`${dateEnd}T23:59:59`)]
    };
  }

  const total = await CallRecord.count({ where });
  const answered = await CallRecord.count({ where: { ...where, status: "answered" } });
  const missed = await CallRecord.count({ where: { ...where, status: "missed" } });
  const busy = await CallRecord.count({ where: { ...where, status: "busy" } });

  return res.json({ total, answered, missed, busy });
};
