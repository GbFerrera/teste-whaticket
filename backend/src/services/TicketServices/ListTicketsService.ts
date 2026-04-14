import { Op, fn, where, col, Filterable, Includeable, literal } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import User from "../../models/User";
import ShowUserService from "../UserServices/ShowUserService";
import Tag from "../../models/Tag";
import CrmLead from "../../models/CrmLead";
import CrmClient from "../../models/CrmClient";

import { intersection } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import ContactTag from "../../models/ContactTag";

import removeAccents from "remove-accents";

import FindCompanySettingOneService from "../CompaniesSettings/FindCompanySettingOneService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  updatedAt?: string;
  showAll?: string;
  userId: number;
  withUnreadMessages?: string;
  queueIds: number[];
  tags: number[];
  users: number[];
  contacts?: string[];
  updatedStart?: string;
  updatedEnd?: string;
  connections?: string[];
  whatsappIds?: number[];
  statusFilters?: string[];
  queuesFilter?: string[];
  isGroup?: string;
  companyId: number;
  allTicket?: string;
  sortTickets?: string;
  searchOnMessages?: string;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const normalizeEnabled = (value?: string | null | boolean) => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    return ["enabled", "enable", "true", "1"].includes(normalized);
  }
  return Boolean(value);
};

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  queueIds,
  tags,
  users,
  status,
  date,
  dateStart,
  dateEnd,
  updatedAt,
  showAll,
  userId,
  withUnreadMessages = "false",
  whatsappIds,
  statusFilters,
  companyId,
  sortTickets = "DESC",
  searchOnMessages = "false"
}: Request): Promise<Response> => {
  const user = await ShowUserService(userId, companyId);

  const hasAllTicketPermission = normalizeEnabled(user.allTicket);
  const hasAllUserChatPermission = normalizeEnabled(user.allUserChat);
  const hasAllQueuesPermission = normalizeEnabled(user.allHistoric);
  const showTicketAllQueues = hasAllQueuesPermission;
  const showTicketWithoutQueue = hasAllTicketPermission;
  const showGroups = Boolean(user.allowGroup);
  const canSeeOtherUsersTickets = hasAllUserChatPermission || hasAllTicketPermission;
  const showPendingNotification = await FindCompanySettingOneService({ companyId, column: "showNotificationPending" });
  const showNotificationPendingValue = showPendingNotification[0].showNotificationPending;
  const userQueueIds = user.queues.map(queue => queue.id);
  const effectiveQueueIds = queueIds && queueIds.length > 0 ? queueIds : userQueueIds;
    let whereCondition: Filterable["where"];

  whereCondition = {
    [Op.or]: [{ userId }, { status: "pending" }],
    queueId: showTicketWithoutQueue ? { [Op.or]: [effectiveQueueIds, null] } : { [Op.or]: [effectiveQueueIds] },
    companyId
  };


  let includeCondition: Includeable[];

  includeCondition = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "email", "profilePicUrl", "acceptAudioMessage", "active", "urlPicture", "companyId"],
      include: ["extraInfo", "tags"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    },
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"]
    },
    {
      model: Whatsapp,
      as: "whatsapp",
      attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
    },
    {
      model: Message,
      as: "messages",
      attributes: ["fromMe"],
      limit: 1,
      order: [["createdAt", "DESC"]],
      separate: true
    }
  ];

  if (status === "open") {
    whereCondition = {
      ...whereCondition,
      userId,
      queueId: { [Op.in]: queueIds },
      isGroup: false
    };
  } else if (status === "group") {
    console.log("📍 Buscando TODOS OS GRUPOS da empresa");
    console.log("📍 allowGroup do usuário:", showGroups);
    
    // **VERIFICAÇÃO CRÍTICA**: Só retorna grupos se usuário tiver allowGroup
    if (!showGroups) {
      console.log("❌ Usuário não tem allowGroup, retornando lista vazia");
      return {
        tickets: [],
        count: 0,
        hasMore: false
      };
    }
    
    // Busca TODOS os grupos da empresa, sem restrição de usuário ou fila
    whereCondition = {
      companyId,
      isGroup: true,
      status: { [Op.notIn]: ["closed", "lgpd", "nps"] }  // Apenas grupos ativos
    };
    console.log("🔍 WhereCondition para grupos:", JSON.stringify(whereCondition, null, 2));
  }
      else
        if (user.profile === "user" && status === "pending" && showTicketWithoutQueue) {
          const TicketsUserFilter: any[] | null = [];

          let ticketsIds = [];

          if (!showTicketAllQueues) {
            ticketsIds = await Ticket.findAll({
              where: {
                userId: { [Op.or]: [user.id, null] },
                queueId: { [Op.or]: [effectiveQueueIds, null] },
                status: "pending",
                companyId
              },
            });
          } else {
            ticketsIds = await Ticket.findAll({
              where: {
                userId: { [Op.or]: [user.id, null] },
                status: "pending",
                companyId
              },
            });
          }

          if (ticketsIds) {
            TicketsUserFilter.push(ticketsIds.map(t => t.id));
          }
          // }

          const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

          whereCondition = {
            ...whereCondition,
            id: ticketsIntersection
          };
        }
        else
          if (user.profile === "user" && status === "pending" && !showTicketWithoutQueue) {
            const TicketsUserFilter: any[] | null = [];

            let ticketsIds = [];

            if (!showTicketAllQueues) {
              ticketsIds = await Ticket.findAll({
                where: {
                  companyId,
                  userId:
                    { [Op.or]: [user.id, null] },
                  status: "pending",
                  queueId: { [Op.in]: effectiveQueueIds }
                },
              });
            } else {
              ticketsIds = await Ticket.findAll({
                where: {
                  companyId,
                  userId:
                    { [Op.or]: [user.id, null] },
                  status: "pending"
                },
              });
            }
            if (ticketsIds) {
              TicketsUserFilter.push(ticketsIds.map(t => t.id));
            }
            // }

            const ticketsIntersection: number[] = intersection(...TicketsUserFilter);

            whereCondition = {
              ...whereCondition,
              id: ticketsIntersection
            };
          }

  if (showAll === "true" && canSeeOtherUsersTickets && status !== "search") {
    if (user.allHistoric === "enabled" && showTicketWithoutQueue) {
      whereCondition = { companyId };
    } else if (user.allHistoric === "enabled" && !showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: { [Op.ne]: null } };
    } else if (user.allHistoric === "disabled" && showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: { [Op.or]: [queueIds, null] } };
    } else if (user.allHistoric === "disabled" && !showTicketWithoutQueue) {
      whereCondition = { companyId, queueId: queueIds };
    }
  }


  if (status && status !== "search") {
    whereCondition = {
      ...whereCondition,
      status: showAll === "true" && status === "pending" ? { [Op.or]: [status, "lgpd"] } : status
    };
  }

  // Aplicar filtro de whatsappIds ANTES de processar status específicos
  if (Array.isArray(whatsappIds) && whatsappIds.length > 0) {
    console.log("🔍 Aplicando filtro de whatsappIds GLOBAL:", whatsappIds);
    whereCondition = {
      ...whereCondition,
      whatsappId: { [Op.in]: whatsappIds }
    };
  }


  if (status === "closed") {
    let latestTickets;

    if (!showTicketAllQueues) {
      let whereCondition2: Filterable["where"] = {
        companyId,
        status: "closed",
      }

      if (showAll === "false" && !canSeeOtherUsersTickets) {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds,
          userId
        }
      } else {
        whereCondition2 = {
          ...whereCondition2,
          queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
        }
      }

      latestTickets = await Ticket.findAll({
        attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
        where: whereCondition2,
        group: ['companyId', 'contactId', 'whatsappId'],
      });

    } else {
      let whereCondition2: Filterable["where"] = {
        companyId,
        status: "closed",
      }

      if (showAll === "false" && !canSeeOtherUsersTickets) {
        whereCondition2 = {
          ...whereCondition2,
          queueId: queueIds,
          userId
        }
      } else {
        whereCondition2 = {
          ...whereCondition2,
          queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
        }
      }

      latestTickets = await Ticket.findAll({
        attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
        where: whereCondition2,
        group: ['companyId', 'contactId', 'whatsappId'],
      });

    }

    const ticketIds = latestTickets.map((t) => t.id);

    whereCondition = {
      id: ticketIds

    };
  }
  else
    if (status === "search") {
      whereCondition = {
        companyId
      }
      let latestTickets;
      if (!showTicketAllQueues && user.profile === "user") {
        latestTickets = await Ticket.findAll({
          attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
          where: {
            [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
            queueId: showAll === "true" || showTicketWithoutQueue ? { [Op.or]: [queueIds, null] } : queueIds,
            companyId
          },
          group: ['companyId', 'contactId', 'whatsappId'],
        });
      } else {
        let whereCondition2: Filterable["where"] = {
          companyId,
          [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }]
        }

        if (showAll === "false" && !canSeeOtherUsersTickets) {
          whereCondition2 = {
            ...whereCondition2,
            queueId: queueIds,

            // [Op.or]: [{ userId }, { status: ["pending", "closed", "group"] }],
          }

        } else if (showAll === "true" && canSeeOtherUsersTickets) {
          whereCondition2 = {
            companyId,
            queueId: { [Op.or]: [queueIds, null] },
            // status: ["pending", "closed", "group"]
          }
        }

        latestTickets = await Ticket.findAll({
          attributes: ['companyId', 'contactId', 'whatsappId', [literal('MAX("id")'), 'id']],
          where: whereCondition2,
          group: ['companyId', 'contactId', 'whatsappId'],
        });

      }

      const ticketIds = latestTickets.map((t) => t.id);

      whereCondition = {
        ...whereCondition,
        id: ticketIds
      };

      // if (date) {
      //   whereCondition = {
      //     createdAt: {
      //       [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      //     }
      //   };
      // }

      // if (dateStart && dateEnd) {
      //   whereCondition = {
      //     updatedAt: {
      //       [Op.between]: [+startOfDay(parseISO(dateStart)), +endOfDay(parseISO(dateEnd))]
      //     }
      //   };
      // }

      // if (updatedAt) {
      //   whereCondition = {
      //     updatedAt: {
      //       [Op.between]: [
      //         +startOfDay(parseISO(updatedAt)),
      //         +endOfDay(parseISO(updatedAt))
      //       ]
      //     }
      //   };
      // }


      if (searchParam) {
        const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
        if (searchOnMessages === "true") {
          includeCondition = [
            ...includeCondition,
            {
              model: Message,
              as: "messages",
              attributes: ["id", "body"],
              where: {
                body: where(
                  fn("LOWER", fn('unaccent', col("body"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                ),
                // ticketId: 
              },
              required: false,
              duplicating: false
            }
          ];
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              {
                "$contact.name$": where(
                  fn("LOWER", fn("unaccent", col("contact.name"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              },
              { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
              {
                "$message.body$": where(
                  fn("LOWER", fn("unaccent", col("body"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              }
            ]
          };
        } else {
          whereCondition = {
            ...whereCondition,
            [Op.or]: [
              {
                "$contact.name$": where(
                  fn("LOWER", fn("unaccent", col("contact.name"))),
                  "LIKE",
                  `%${sanitizedSearchParam}%`
                )
              },
              { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
              // {
              //   "$message.body$": where(
              //     fn("LOWER", fn("unaccent", col("body"))),
              //     "LIKE",
              //     `%${sanitizedSearchParam}%`
              //   )
              // }
            ]
          };
        }

      }

      if (Array.isArray(tags) && tags.length > 0) {
        const contactTagFilter: any[] | null = [];
        // for (let tag of tags) {
        const contactTags = await ContactTag.findAll({
          where: { tagId: tags }
        });
        if (contactTags) {
          contactTagFilter.push(contactTags.map(t => t.contactId));
        }
        // }

        const contactsIntersection: number[] = intersection(...contactTagFilter);

        whereCondition = {
          ...whereCondition,
          contactId: contactsIntersection
        };
      }

      if (Array.isArray(users) && users.length > 0) {
        whereCondition = {
          ...whereCondition,
          userId: users
        };
      }


      // Filtro de whatsappIds já aplicado globalmente acima

      if (Array.isArray(statusFilters) && statusFilters.length > 0) {
        whereCondition = {
          ...whereCondition,
          status: { [Op.in]: statusFilters }
        };
      }

    } else
      if (withUnreadMessages === "true") {
        // console.log(showNotificationPendingValue)
        whereCondition = {
          [Op.or]: [
            {
              userId,
              status: showNotificationPendingValue ? { [Op.notIn]: ["closed", "lgpd", "nps"] } : { [Op.notIn]: ["pending", "closed", "lgpd", "nps", "group"] },
              queueId: { [Op.in]: userQueueIds },
              unreadMessages: { [Op.gt]: 0 },
              companyId,
              isGroup: showGroups ? { [Op.or]: [true, false] } : false
            },
            {
              status: showNotificationPendingValue ? { [Op.in]: ["pending", "group"] } : { [Op.in]: ["group"] },
              queueId: showTicketWithoutQueue ? { [Op.or]: [userQueueIds, null] } : { [Op.or]: [userQueueIds] },
              unreadMessages: { [Op.gt]: 0 },
              companyId,
              isGroup: showGroups ? { [Op.or]: [true, false] } : false
            }
          ]
        };

        if (status === "group" && (user.allowGroup || showAll === "true")) {
          whereCondition = {
            ...whereCondition,
            queueId: { [Op.or]: [userQueueIds, null] },
          };
        }
      }

  // Aplicar filtros de fila e usuário selecionados (se houver)
  if (Array.isArray(queueIds) && queueIds.length > 0 && status !== "search") {
    whereCondition = {
      ...whereCondition,
      queueId: queueIds
    };
  }

  if (Array.isArray(users) && users.length > 0 && status !== "search") {
    whereCondition = {
      ...whereCondition,
      userId: users
    };
  }

  if (Array.isArray(tags) && tags.length > 0 && status !== "search") {
    const contactTagFilter: any[] | null = [];
    const contactTags = await ContactTag.findAll({
      where: { tagId: tags }
    });
    if (contactTags) {
      contactTagFilter.push(contactTags.map(t => t.contactId));
    }
    const contactsIntersection: number[] = intersection(...contactTagFilter);
    whereCondition = {
      ...whereCondition,
      contactId: contactsIntersection
    };
  }

if (Array.isArray(users) && users.length > 0) {
  whereCondition = {
    ...whereCondition,
    userId: users
  };
}

const DEFAULT_TICKET_LIMIT = Number(process.env.TICKET_PAGE_LIMIT) || 350;

const normalizedPage = (value?: string): number => {
  const page = Number(value);
  if (!page || page < 1) {
    return 1;
  }
  return page;
};

// Adicionar filtro de busca se existir
if (searchParam) {
  const sanitizedSearchParam = removeAccents(searchParam.toLocaleLowerCase().trim());
  
  // Substituir o include 'messages' existente em vez de duplicar
  includeCondition = includeCondition.map(inc => {
    if ((inc as any).as === "messages") {
      return {
        model: Message,
        as: "messages",
        attributes: ["id", "body"],
        where: {
          body: where(
            fn("LOWER", fn('unaccent', col("messages.body"))),
            "LIKE",
            `%${sanitizedSearchParam}%`
          ),
        },
        required: false,
        duplicating: false
      };
    }
    return inc;
  });
  
  whereCondition = {
    ...whereCondition,
    [Op.or]: [
      {
        "$contact.name$": where(
          fn("LOWER", fn("unaccent", col("contact.name"))),
          "LIKE",
          `%${sanitizedSearchParam}%`
        )
      },
      { "$contact.number$": { [Op.like]: `%${sanitizedSearchParam}%` } },
      {
        "$messages.body$": where(
          fn("LOWER", fn("unaccent", col("messages.body"))),
          "LIKE",
          `%${sanitizedSearchParam}%`
        )
      }
    ]
  };
}

// Filtros de status
if (Array.isArray(statusFilters) && statusFilters.length > 0) {
  whereCondition = {
    ...whereCondition,
    status: { [Op.in]: statusFilters }
  };
}

  const currentPage = normalizedPage(pageNumber);
  const limit = DEFAULT_TICKET_LIMIT;
  const offset = limit * (currentPage - 1);

  const allowedQueueIdsForPermission = [...userQueueIds];
  if (showTicketWithoutQueue) {
    allowedQueueIdsForPermission.push(null);
  }

  if (!canSeeOtherUsersTickets) {
    const permissionClause: any = {
      [Op.or]: [
        { userId: user.id },
        {
          [Op.and]: [
            { userId: null },
            { status: "pending" },
            allowedQueueIdsForPermission.length > 0
              ? { queueId: { [Op.or]: allowedQueueIdsForPermission } }
              : {}
          ]
        }
      ]
    };

    whereCondition = {
      [Op.and]: [
        whereCondition,
        permissionClause
      ]
    } as Filterable["where"];
  }

const { count, rows: tickets } = await Ticket.findAndCountAll({
  where: whereCondition,
  include: includeCondition,
  attributes: [
    "id",
    "status",
    "contactId",
    "userId",
    "queueId",
    "createdAt",
    "updatedAt",
    "lastMessage",
    "unreadMessages",
    "isGroup",
    "fromMe",
    "channel",
    "useIntegration",
    "integrationId",
    "crmClientId"
  ],
  distinct: true,
  limit,
  offset,
  order: [["updatedAt", sortTickets]],
  subQuery: false
});

  const hasMore = count > offset + tickets.length;

  // Garantir que campos críticos nunca sejam null para evitar erros no frontend
  const safeTickets = tickets.map(ticket => {
    const ticketJSON = ticket.toJSON() as any;
    
    // Se user for null, criar objeto placeholder
    if (!ticketJSON.user) {
      ticketJSON.user = { id: null, name: "Sem usuário" };
    }
    
    // Se queue for null, criar objeto placeholder
    if (!ticketJSON.queue) {
      ticketJSON.queue = { id: null, name: "Sem fila", color: "#999" };
    }
    
    // Se contact for null, criar objeto placeholder
    if (!ticketJSON.contact) {
      ticketJSON.contact = { 
        id: null, 
        name: "Contato removido", 
        number: "",
        profilePicUrl: null,
        email: null
      };
    }
    
    // Garantir que tags seja sempre um array
    if (!ticketJSON.tags || !Array.isArray(ticketJSON.tags)) {
      ticketJSON.tags = [];
    } else {
      // Filtrar tags nulas ou inválidas e garantir campos necessários
      ticketJSON.tags = ticketJSON.tags
        .filter((tag: any) => tag && tag.name)
        .map((tag: any) => ({
          id: tag.id || null,
          name: tag.name || "Tag sem nome",
          color: tag.color || "#999999"
        }));
    }
    
    // Garantir que whatsapp não seja null
    if (!ticketJSON.whatsapp) {
      ticketJSON.whatsapp = { 
        id: null, 
        name: "WhatsApp desconectado",
        expiresTicket: null,
        groupAsTicket: null
      };
    }
    
    // Adicionar campo lastMessageFromMe baseado na última mensagem
    if (ticketJSON.messages && ticketJSON.messages.length > 0) {
      ticketJSON.lastMessageFromMe = ticketJSON.messages[0].fromMe;
      delete ticketJSON.messages; // Remove messages do retorno para não sobrecarregar
    } else {
      ticketJSON.lastMessageFromMe = null;
    }
    
    return ticketJSON;
  });

  return {
    tickets: safeTickets,
    count,
    hasMore
  };
};

export default ListTicketsService;
