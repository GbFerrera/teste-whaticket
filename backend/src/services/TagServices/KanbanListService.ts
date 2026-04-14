import { Op } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Contact from "../../models/Contact";

interface Request {
  companyId: number;
}

const KanbanListService = async ({
  companyId
}: Request): Promise<Tag[]> => {
  const tags = await Tag.findAll({
    where: {
      kanban: 1,
      companyId: companyId,
    },
    include: [
      {
        model: Contact,
        as: "contacts",
        attributes: ["id", "name"],
        through: { attributes: [] }
      }
    ],
    order: [["id", "ASC"]],
  });
  //console.log(tags);
  return tags;
};

export default KanbanListService;