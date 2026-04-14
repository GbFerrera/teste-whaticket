import Plan from "../../models/Plan";

interface PublicPlan {
  id: number;
  name: string;
  amount: string;
  users: number;
  connections: number;
  queues: number;
  useWhatsapp: boolean;
  useFacebook: boolean;
  useInstagram: boolean;
  useCampaigns: boolean;
  useSchedules: boolean;
  useInternalChat: boolean;
  useExternalApi: boolean;
  useKanban: boolean;
  useOpenAi: boolean;
  trial: boolean;
  trialDays: number;
  recurrence: string;
}

const ListPublicPlansSimpleService = async (): Promise<PublicPlan[]> => {
  const plans = await Plan.findAll({
    where: { isPublic: true },
    attributes: [
      "id", "name", "amount", "users", "connections", "queues",
      "useWhatsapp", "useFacebook", "useInstagram", "useCampaigns", 
      "useSchedules", "useInternalChat", "useExternalApi", "useKanban", 
      "useOpenAi", "trial", "trialDays", "recurrence"
    ],
    order: [["name", "ASC"]]
  });

  return plans.map(plan => plan.get({ plain: true })) as PublicPlan[];
};

export default ListPublicPlansSimpleService;
