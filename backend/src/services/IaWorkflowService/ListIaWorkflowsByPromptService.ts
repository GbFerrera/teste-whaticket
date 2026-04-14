import IaWorkflow from "../../models/IaWorkflow";

interface Request {
  companyId: number;
  orchestratorPromptId: number;
}

const ListIaWorkflowsByPromptService = async ({
  companyId,
  orchestratorPromptId
}: Request) => {
  const links = await IaWorkflow.findAll({
    where: { companyId, orchestratorPromptId }
  });

  return links;
};

export default ListIaWorkflowsByPromptService;
