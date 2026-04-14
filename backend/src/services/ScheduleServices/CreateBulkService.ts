import Schedule from "../../models/Schedule";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";
import AppError from "../../errors/AppError";

interface Request {
  body: string;
  sendAt: string;
  companyId: number;
  userId: number;
  whatsappId: number;
  ticketUserId?: number;
  queueId?: number;
  openTicket?: string;
  statusTicket?: string;
  intervalo?: number;
  valorIntervalo?: number;
  enviarQuantasVezes?: number;
  tipoDias?: number;
  contadorEnvio?: number;
  assinar?: boolean;
  sendType: "multiple" | "tag";
  contactIds?: number[];
  tagIds?: number[];
}

interface Response {
  schedules: Schedule[];
  count: number;
}

const CreateBulkService = async ({
  body,
  sendAt,
  companyId,
  userId,
  whatsappId,
  ticketUserId,
  queueId,
  openTicket = "enabled",
  statusTicket = "closed",
  intervalo = 1,
  valorIntervalo = 0,
  enviarQuantasVezes = 1,
  tipoDias = 4,
  contadorEnvio = 0,
  assinar = false,
  sendType,
  contactIds = [],
  tagIds = []
}: Request): Promise<Response> => {
  let targetContactIds: number[] = [];

  // Determinar quais contatos serão alvo dos lembretes
  if (sendType === "multiple") {
    targetContactIds = contactIds;
  } else if (sendType === "tag") {
    // Buscar todos os contatos que possuem as tags selecionadas
    const contactTags = await ContactTag.findAll({
      where: {
        tagId: tagIds
      },
      include: [{
        model: Contact,
        as: "contact",
        where: {
          companyId
        },
        attributes: ["id"]
      }],
      attributes: ["contactId"],
      raw: true
    });

    targetContactIds = [...new Set(contactTags.map(ct => ct.contactId))];
  }

  if (targetContactIds.length === 0) {
    throw new AppError("Nenhum contato encontrado para envio", 400);
  }

  // Criar um lembrete para cada contato
  const schedules: Schedule[] = [];

  for (const contactId of targetContactIds) {
    const schedule = await Schedule.create({
      body,
      sendAt,
      contactId,
      companyId,
      userId,
      whatsappId,
      ticketUserId,
      queueId,
      openTicket,
      statusTicket,
      intervalo,
      valorIntervalo,
      enviarQuantasVezes,
      tipoDias,
      contadorEnvio,
      assinar,
      status: "PENDENTE"
    });

    schedules.push(schedule);
  }

  return {
    schedules,
    count: schedules.length
  };
};

export default CreateBulkService;
