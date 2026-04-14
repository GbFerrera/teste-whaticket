import moment from "moment-timezone";
import { Op } from "sequelize";
import ScheduledDispatcher from "../../models/ScheduledDispatcher";
import ScheduledDispatchLog from "../../models/ScheduledDispatchLog";
import Contact from "../../models/Contact";
import FinanceiroFatura from "../../models/FinanceiroFatura";
import CrmClient from "../../models/CrmClient";
import { addDispatchJob } from "../../queues/dispatchQueue";
import logger from "../../utils/logger";

const TZ = process.env.TZ || "America/Sao_Paulo";
const OPEN_INVOICE_STATUS = ["aberta", "vencida"];

interface DispatchTarget {
  contact: Contact;
  client?: CrmClient | null;
  extra?: Record<string, any>;
}

const hasRunForContactToday = async (
  dispatcherId: number,
  companyId: number,
  contactId: number,
  dayStart: Date,
  dayEnd: Date
) => {
  const existing = await ScheduledDispatchLog.findOne({
    where: {
      dispatcherId,
      companyId,
      contactId,
      createdAt: {
        [Op.between]: [dayStart, dayEnd]
      } as any
    }
  });

  return !!existing;
};

const collectBirthdayTargets = async (
  dispatcher: ScheduledDispatcher,
  now: moment.Moment
): Promise<DispatchTarget[]> => {
  const clients = await CrmClient.findAll({
    where: {
      companyId: dispatcher.companyId,
      birthDate: { [Op.ne]: null },
      status: "active"
    },
    include: [
      {
        model: Contact,
        as: "contact"
      }
    ]
  });

  const today = now.format("MM-DD");

  return clients
    .map(client => {
      if (!client.birthDate) return null;
      const birthday = moment(client.birthDate).tz(TZ).format("MM-DD");
      if (birthday !== today) return null;
      const contact = client.contact;
      if (!contact?.id || !contact.number) return null;
      return { contact, client };
    })
    .filter(Boolean) as DispatchTarget[];
};

const collectReminderTargets = async (
  dispatcher: ScheduledDispatcher,
  now: moment.Moment
): Promise<DispatchTarget[]> => {
  const daysBefore = dispatcher.daysBeforeDue ?? 0;
  const targetDate = now
    .clone()
    .add(daysBefore, "days")
    .format("YYYY-MM-DD");

  const invoices = await FinanceiroFatura.findAll({
    where: {
      companyId: dispatcher.companyId,
      status: { [Op.in]: OPEN_INVOICE_STATUS },
      dataVencimento: targetDate
    },
    include: [
      {
        model: CrmClient,
        include: [
          {
            model: Contact,
            as: "contact"
          }
        ]
      }
    ]
  });

  return invoices
    .map(invoice => {
      const contact = invoice.client?.contact;
      if (!contact) return null;
      return {
        contact,
        client: invoice.client,
        extra: { invoice }
      };
    })
    .filter(Boolean) as DispatchTarget[];
};

const collectOverdueTargets = async (
  dispatcher: ScheduledDispatcher,
  now: moment.Moment
): Promise<DispatchTarget[]> => {
  const daysAfter = dispatcher.daysAfterDue ?? 0;
  const limitDate = now.clone().subtract(daysAfter, "days").format("YYYY-MM-DD");

  const invoices = await FinanceiroFatura.findAll({
    where: {
      companyId: dispatcher.companyId,
      status: { [Op.in]: OPEN_INVOICE_STATUS },
      dataVencimento: { [Op.lte]: limitDate }
    },
    include: [
      {
        model: CrmClient,
        include: [
          {
            model: Contact,
            as: "contact"
          }
        ]
      }
    ]
  });

  return invoices
    .map(invoice => {
      const contact = invoice.client?.contact;
      if (!contact) return null;
      return {
        contact,
        client: invoice.client,
        extra: { invoice }
      };
    })
    .filter(Boolean) as DispatchTarget[];
};

const formatCurrencyPtBr = (value?: string | number | null) => {
  const numericValue = Number(value ?? 0);
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const buildVariables = (
  dispatcher: ScheduledDispatcher,
  contact: Contact,
  extra?: Record<string, any>,
  client?: CrmClient | null
) => {
  const variables: Record<string, any> = {
    contactName: contact.name,
    firstName: contact.name?.split(" ")[0] || "",
    contactNumber: contact.number,
    contactEmail: contact.email,
    dispatcherTitle: dispatcher.title
  };

  if (client) {
    variables.clientName = client.name || client.companyName;
    variables.clientType = client.type;
    variables.clientStatus = client.status;
    if (client.birthDate) {
      variables.clientBirthday = moment(client.birthDate).format("YYYY-MM-DD");
    }
  }

  if (contact.birthday) {
    variables.contactBirthday = moment(contact.birthday).format("YYYY-MM-DD");
  }

  if (extra?.invoice) {
    const invoice = extra.invoice as FinanceiroFatura;
    const dueMoment = moment(invoice.dataVencimento).tz(TZ);
    const invoiceNumericValue = Number(invoice.valor ?? 0);
    variables.invoiceId = invoice.id;
    variables.invoiceValue = formatCurrencyPtBr(invoice.valor);
    variables.invoiceValueRaw = invoiceNumericValue;
    variables.invoiceDueDate = dueMoment.format("DD/MM/YYYY");
    variables.invoiceDueDateISO = dueMoment.format("YYYY-MM-DD");
    variables.invoiceStatus = invoice.status;
    variables.invoiceDescription = invoice.descricao || "";
    const today = moment().tz(TZ);
    variables.daysUntilDue = dueMoment.diff(today, "days");
    variables.daysLate = today.diff(dueMoment, "days");
  }

  return variables;
};

const loadTargets = async (
  dispatcher: ScheduledDispatcher,
  now: moment.Moment
): Promise<DispatchTarget[]> => {
  switch (dispatcher.eventType) {
    case "birthday":
      return collectBirthdayTargets(dispatcher, now);
    case "invoice_reminder":
      return collectReminderTargets(dispatcher, now);
    case "invoice_overdue":
      return collectOverdueTargets(dispatcher, now);
    default:
      return [];
  }
};

const ensureDispatcherReady = (
  dispatcher: ScheduledDispatcher,
  now: moment.Moment
) => {
  const startDateTime = moment
    .tz(`${now.format("YYYY-MM-DD")} ${dispatcher.startTime}`, "YYYY-MM-DD HH:mm", TZ);
  if (now.isBefore(startDateTime)) {
    return false;
  }
  if (!dispatcher.whatsappId) {
    logger.warn(
      `[ScheduledDispatcher] Dispatcher ${dispatcher.id} sem whatsapp configurado`
    );
    return false;
  }
  return true;
};

const runScheduledDispatchers = async () => {
  const now = moment().tz(TZ);
  const dayStart = now.clone().startOf("day").toDate();
  const dayEnd = now.clone().endOf("day").toDate();

  const dispatchers = await ScheduledDispatcher.findAll({
    where: { active: true }
  });

  for (const dispatcher of dispatchers) {
    if (!ensureDispatcherReady(dispatcher, now)) {
      continue;
    }

    let sendOffset = 0;
    const targets = await loadTargets(dispatcher, now);

    if (!targets.length) {
      continue;
    }

    logger.info(
      `[ScheduledDispatcher] Dispatcher ${dispatcher.id} - ${targets.length} alvos encontrados`
    );

    for (const target of targets) {
      const { contact, extra, client } = target;
      if (!contact?.id || !contact.number) {
        continue;
      }

      const alreadySent = await hasRunForContactToday(
        dispatcher.id,
        dispatcher.companyId,
        contact.id,
        dayStart,
        dayEnd
      );

      if (alreadySent) {
        continue;
      }

      const log = await ScheduledDispatchLog.create({
        dispatcherId: dispatcher.id,
        contactId: contact.id,
        companyId: dispatcher.companyId,
        status: "queued"
      });

      const delayMs =
        sendOffset * (dispatcher.sendIntervalSeconds || 30) * 1000;
      sendOffset += 1;

      const variables = buildVariables(dispatcher, contact, extra, client || null);

      await addDispatchJob(
        {
          logId: log.id,
          dispatcherId: dispatcher.id,
          companyId: dispatcher.companyId,
          contactId: contact.id,
          whatsappId: dispatcher.whatsappId!,
          template: dispatcher.messageTemplate,
          variables,
          delayMs
        },
        {}
      );
    }
  }
};

export default runScheduledDispatchers;
