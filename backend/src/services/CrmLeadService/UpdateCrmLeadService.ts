import { Op } from "sequelize";
import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CrmLead from "../../models/CrmLead";
import syncLeadToClient from "./helpers/syncLeadToClient";
import {
  resolveLeadContactId,
  resolveLeadPrimaryTicketId
} from "./helpers/resolveLeadRelations";

interface Request {
  id: number | string;
  companyId: number;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  document?: string;
  companyName?: string;
  position?: string;
  source?: string;
  campaign?: string;
  medium?: string;
  status?: string;
  leadStatus?: string;
  score?: number;
  temperature?: string;
  ownerUserId?: number;
  notes?: string;
  lastActivityAt?: Date;
  contactId?: number;
  primaryTicketId?: number;
}

const UpdateCrmLeadService = async ({
  id,
  companyId,
  ...data
}: Request): Promise<CrmLead> => {
  const lead = await CrmLead.findOne({
    where: { id, companyId }
  });

  if (!lead) {
    throw new AppError("Lead não encontrado.", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email().nullable(),
    phone: Yup.string().nullable(),
    status: Yup.string()
      .oneOf(["new", "contacted", "qualified", "unqualified", "converted", "lost"])
      .nullable(),
    leadStatus: Yup.string().nullable(),
    score: Yup.number().min(0).nullable(),
    temperature: Yup.string().oneOf([null, "frio", "morno", "quente"]).nullable(),
    contactId: Yup.number().nullable(),
    primaryTicketId: Yup.number().nullable()
  });

  await schema.validate(data);

  if (data.email) {
    const existingLead = await CrmLead.findOne({
      where: {
        companyId,
        email: data.email,
        id: { [Op.ne]: id }
      }
    });

    if (existingLead) {
      throw new AppError("Outro lead já usa esse e-mail nesta empresa.");
    }
  }

  const previousStatus = lead.status;
  const previousLeadStatus = lead.leadStatus;

  const contactId = await resolveLeadContactId({
    companyId,
    providedContactId: data.contactId,
    phone: data.phone,
    currentContactId: lead.contactId
  });

  const primaryTicketId = await resolveLeadPrimaryTicketId({
    companyId,
    providedPrimaryTicketId: data.primaryTicketId,
    currentPrimaryTicketId: lead.primaryTicketId
  });

  await lead.update({
    ...data,
    contactId,
    primaryTicketId,
    leadStatus: data.leadStatus ?? lead.leadStatus,
    lastActivityAt: data.lastActivityAt || lead.lastActivityAt
  });

  const shouldSyncByStatus =
    data.status === "converted" && previousStatus !== "converted";
  const shouldSyncByLeadStatus =
    (data.leadStatus === "convertido" && previousLeadStatus !== "convertido") ||
    (lead.leadStatus === "convertido" && previousLeadStatus !== "convertido");

  if (shouldSyncByStatus || shouldSyncByLeadStatus) {
    await syncLeadToClient(lead);
  }

  return lead;
};

export default UpdateCrmLeadService;
