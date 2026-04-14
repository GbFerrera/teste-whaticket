import { Request, Response } from "express";
import { fn, col, Op } from "sequelize";
import DashboardDataService, { DashboardData, Params } from "../services/ReportService/DashbardDataService";
import { TicketsAttendance } from "../services/ReportService/TicketsAttendance";
import { TicketsDayService } from "../services/ReportService/TicketsDayService";
import TicketsQueuesService from "../services/TicketServices/TicketsQueuesService";
import Tag from "../models/Tag";
import TicketTag from "../models/TicketTag";
import ContactTag from "../models/ContactTag";

type IndexQuery = {
  initialDate: string;
  finalDate: string;
  companyId: number | any;
};

type IndexQueryPainel = {
  dateStart: string;
  dateEnd: string;
  status: string[];
  queuesIds: string[];
  showAll: string;
};
export const index = async (req: Request, res: Response): Promise<Response> => {
  const params: Params = req.query;
  const { companyId } = req.user;
  let daysInterval = 3;

  const dashboardData: DashboardData = await DashboardDataService(
    companyId,
    params
  );

  // ==============================
  // Métricas adicionais: Tags e Kanban
  // ==============================
  try {
    // Total de tags da empresa
    const totalTags = await (Tag as any).count({ where: { companyId } });

    // Tags configuradas como Kanban, com contagem de tickets por tag
    const kanbanTags = await (Tag as any).findAll({
      where: { companyId, kanban: 1 },
      include: [
        {
          model: TicketTag,
          as: "ticketTags",
          attributes: []
        }
      ],
      attributes: [
        "id",
        "name",
        "color",
        [fn("COUNT", col("ticketTags.ticketId")), "ticketsCount"]
      ],
      group: ["Tag.id"],
      order: [["id", "ASC"]]
    });

    const kanbanSummary = kanbanTags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: (tag as any).color,
      ticketsCount: Number((tag as any).get("ticketsCount") || 0)
    }));

    const tagsSummary = {
      totalTags,
      totalKanbanTags: kanbanSummary.length
    };

    // Contatos por Tag (todas as tags, incluindo Kanban)
    const tagsWithContacts = await (Tag as any).findAll({
      where: { companyId },
      include: [
        {
          model: ContactTag,
          as: "contactTags",
          attributes: []
        }
      ],
      attributes: [
        "id",
        "name",
        "color",
        "kanban",
        [fn("COUNT", col("contactTags.contactId")), "contactsCount"]
      ],
      group: ["Tag.id"],
      order: [["name", "ASC"]]
    });

    const tagsContactsSummary = tagsWithContacts.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: (tag as any).color,
      kanban: (tag as any).kanban,
      contactsCount: Number((tag as any).get("contactsCount") || 0)
    }));

    // Tendência de contatos por Tag (7, 15 e 30 dias)
    const now = new Date();
    const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const date15d = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const contactsByTag7d = await ContactTag.findAll({
      include: [
        {
          model: Tag,
          as: "tags",
          where: { companyId },
          attributes: []
        }
      ],
      attributes: [["tagId", "tagId"], [fn("COUNT", col("contactId")), "count7d"]],
      where: {
        createdAt: { [Op.gte]: date7d }
      },
      group: ["ContactTag.tagId"]
    });

    const contactsByTag15d = await ContactTag.findAll({
      include: [
        {
          model: Tag,
          as: "tags",
          where: { companyId },
          attributes: []
        }
      ],
      attributes: [["tagId", "tagId"], [fn("COUNT", col("contactId")), "count15d"]],
      where: {
        createdAt: { [Op.gte]: date15d }
      },
      group: ["ContactTag.tagId"]
    });

    const contactsByTag30d = await ContactTag.findAll({
      include: [
        {
          model: Tag,
          as: "tags",
          where: { companyId },
          attributes: []
        }
      ],
      attributes: [["tagId", "tagId"], [fn("COUNT", col("contactId")), "count30d"]],
      where: {
        createdAt: { [Op.gte]: date30d }
      },
      group: ["ContactTag.tagId"]
    });

    const trendMap: Record<number, { contacts7d: number; contacts15d: number; contacts30d: number }> = {};

    contactsByTag7d.forEach((row: any) => {
      const tagId = row.get("tagId") as number;
      if (!trendMap[tagId]) trendMap[tagId] = { contacts7d: 0, contacts15d: 0, contacts30d: 0 };
      trendMap[tagId].contacts7d = Number(row.get("count7d") || 0);
    });

    contactsByTag15d.forEach((row: any) => {
      const tagId = row.get("tagId") as number;
      if (!trendMap[tagId]) trendMap[tagId] = { contacts7d: 0, contacts15d: 0, contacts30d: 0 };
      trendMap[tagId].contacts15d = Number(row.get("count15d") || 0);
    });

    contactsByTag30d.forEach((row: any) => {
      const tagId = row.get("tagId") as number;
      if (!trendMap[tagId]) trendMap[tagId] = { contacts7d: 0, contacts15d: 0, contacts30d: 0 };
      trendMap[tagId].contacts30d = Number(row.get("count30d") || 0);
    });

    const tagsContactsTrend = tagsContactsSummary.map(tag => ({
      ...tag,
      contacts7d: trendMap[tag.id]?.contacts7d || 0,
      contacts15d: trendMap[tag.id]?.contacts15d || 0,
      contacts30d: trendMap[tag.id]?.contacts30d || 0
    }));

    return res.status(200).json({
      ...dashboardData,
      tagsSummary,
      kanbanSummary,
      tagsContactsSummary,
      tagsContactsTrend
    });
  } catch (err) {
    // Em caso de erro nas métricas adicionais, ainda retornamos o dashboard básico
    console.error("Erro ao carregar métricas de tags/kanban para o dashboard:", err);
    return res.status(200).json(dashboardData);
  }
};

// Mapeamento DDD → Estado brasileiro
const dddToState: Record<string, string> = {
  "11":"SP","12":"SP","13":"SP","14":"SP","15":"SP","16":"SP","17":"SP","18":"SP","19":"SP",
  "21":"RJ","22":"RJ","24":"RJ",
  "27":"ES","28":"ES",
  "31":"MG","32":"MG","33":"MG","34":"MG","35":"MG","37":"MG","38":"MG",
  "41":"PR","42":"PR","43":"PR","44":"PR","45":"PR","46":"PR",
  "47":"SC","48":"SC","49":"SC",
  "51":"RS","53":"RS","54":"RS","55":"RS",
  "61":"DF",
  "62":"GO","64":"GO",
  "63":"TO",
  "65":"MT","66":"MT",
  "67":"MS",
  "68":"AC",
  "69":"RO",
  "71":"BA","73":"BA","74":"BA","75":"BA","77":"BA",
  "79":"SE",
  "81":"PE","87":"PE",
  "82":"AL",
  "83":"PB",
  "84":"RN",
  "85":"CE","88":"CE",
  "86":"PI","89":"PI",
  "91":"PA","93":"PA","94":"PA",
  "92":"AM","97":"AM",
  "95":"RR",
  "96":"AP",
  "98":"MA","99":"MA",
};

export const charts = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const Contact = (await import("../models/Contact")).default;

    // 1. Contatos por mês (últimos 12 meses)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const contactsByMonth = await Contact.findAll({
      where: {
        companyId,
        createdAt: { [Op.gte]: twelveMonthsAgo }
      },
      attributes: [
        [fn("DATE_TRUNC", "month", col("createdAt")), "month"],
        [fn("COUNT", col("id")), "count"]
      ],
      group: [fn("DATE_TRUNC", "month", col("createdAt"))],
      order: [[fn("DATE_TRUNC", "month", col("createdAt")), "ASC"]],
      raw: true
    });

    // Preencher meses sem dados
    const monthsData: { month: string; label: string; count: number }[] = [];
    const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = (contactsByMonth as any[]).find((r: any) => {
        const rDate = new Date(r.month);
        return rDate.getFullYear() === d.getFullYear() && rDate.getMonth() === d.getMonth();
      });
      monthsData.push({
        month: key,
        label: monthNames[d.getMonth()],
        count: found ? Number(found.count) : 0
      });
    }

    // Total de contatos
    const totalContacts = await Contact.count({ where: { companyId } });

    // Novos contatos este mês
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newContactsThisMonth = await Contact.count({
      where: { companyId, createdAt: { [Op.gte]: startOfMonth } }
    });

    // Novos contatos mês anterior
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const newContactsPrevMonth = await Contact.count({
      where: {
        companyId,
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lte]: endOfPrevMonth
        }
      }
    });

    // 2. Contatos por Tag (top 5)
    const tagsWithContacts = await (Tag as any).findAll({
      where: { companyId },
      include: [{ model: ContactTag, as: "contactTags", attributes: [] }],
      attributes: [
        "id", "name", "color",
        [fn("COUNT", col("contactTags.contactId")), "contactsCount"]
      ],
      group: ["Tag.id"],
      order: [[fn("COUNT", col("contactTags.contactId")), "DESC"]],
      limit: 5,
      subQuery: false
    });

    const tagsSummary = tagsWithContacts.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color || "#3b82f6",
      count: Number(tag.get("contactsCount") || 0)
    }));

    // 3. Contatos por Estado (via DDD do número de telefone)
    const allContacts = await Contact.findAll({
      where: { companyId, isGroup: false },
      attributes: ["number"],
      raw: true
    });

    const stateCount: Record<string, number> = {};
    (allContacts as any[]).forEach((c: any) => {
      if (!c.number) return;
      // Número brasileiro: 55 + DDD + número
      let num = c.number.replace(/\D/g, "");
      if (num.startsWith("55") && num.length >= 12) {
        const ddd = num.substring(2, 4);
        const state = dddToState[ddd];
        if (state) {
          stateCount[state] = (stateCount[state] || 0) + 1;
        }
      }
    });

    const contactsByState = Object.entries(stateCount)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    return res.json({
      contactsByMonth: monthsData,
      totalContacts,
      newContactsThisMonth,
      newContactsPrevMonth,
      tagsSummary,
      contactsByState
    });
  } catch (err) {
    console.error("Erro ao carregar dados dos gráficos:", err);
    return res.status(500).json({ error: "Erro ao carregar dados dos gráficos" });
  }
};

export const reportsUsers = async (req: Request, res: Response): Promise<Response> => {

  const { initialDate, finalDate, companyId } = req.query as IndexQuery

  const { data } = await TicketsAttendance({ initialDate, finalDate, companyId });

  return res.json({ data });

}

export const reportsDay = async (req: Request, res: Response): Promise<Response> => {

  const { initialDate, finalDate, companyId } = req.query as IndexQuery

  const { count, data } = await TicketsDayService({ initialDate, finalDate, companyId });

  return res.json({ count, data });

}

export const DashTicketsQueues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile, id: userId } = req.user;
  const { dateStart, dateEnd, status, queuesIds, showAll } = req.query as IndexQueryPainel;

  const tickets = await TicketsQueuesService({
    showAll: profile === "admin" ? showAll : false,
    dateStart,
    dateEnd,
    status,
    queuesIds,
    userId,
    companyId,
    profile
  });

  return res.status(200).json(tickets);
};