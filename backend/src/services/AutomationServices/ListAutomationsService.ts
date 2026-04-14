import { Op } from "sequelize";
import Automation from "../../models/Automation";
import AutomationAction from "../../models/AutomationAction";

interface ListAutomationsData {
  companyId: number;
  searchParam?: string;
  triggerType?: string;
  isActive?: boolean;
  pageNumber?: string | number;
}

interface ListAutomationsResult {
  automations: Automation[];
  count: number;
  hasMore: boolean;
}

const ListAutomationsService = async (data: ListAutomationsData): Promise<ListAutomationsResult> => {
  const { companyId, searchParam, triggerType, isActive, pageNumber = "1" } = data;

  const limit = 20;
  const offset = limit * (Number(pageNumber) - 1);

  const whereCondition: any = { companyId };

  if (searchParam) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { description: { [Op.iLike]: `%${searchParam}%` } }
    ];
  }

  if (triggerType) {
    whereCondition.triggerType = triggerType;
  }

  if (isActive !== undefined) {
    whereCondition.isActive = isActive;
  }

  const { count, rows: automations } = await Automation.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: AutomationAction,
        as: "actions",
        separate: true,
        order: [["order", "ASC"]]
      }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  const hasMore = count > offset + automations.length;

  return {
    automations,
    count,
    hasMore
  };
};

export default ListAutomationsService;
