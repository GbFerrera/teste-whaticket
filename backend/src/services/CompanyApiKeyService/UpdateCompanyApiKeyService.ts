import CompanyApiKey from "../../models/CompanyApiKey";

type Params = {
  companyId: number;
  column: string;
  data: string;
};

const UpdateCompanyApiKeyService = async ({ companyId, column, data }: Params): Promise<any> => {
  try {
    // Buscar o registro existente ou criar um novo
    let companyApiKey = await CompanyApiKey.findOne({
      where: { companyId }
    });

    if (!companyApiKey) {
      // Criar novo registro se não existir
      companyApiKey = await CompanyApiKey.create({
        companyId,
        label: "API Keys",
        token: "generated-token-" + Date.now(), // Token temporário
      });
    }

    // Atualizar o campo específico
    await companyApiKey.update({ [column]: data });

    console.log(`[DEBUG] UpdateCompanyApiKeyService: Atualizado ${column} = ${data} para companyId ${companyId}`);
    return companyApiKey;
  } catch (error) {
    console.error(`[ERROR] UpdateCompanyApiKeyService: Erro ao atualizar ${column}:`, error);
    throw error;
  }
};

export default UpdateCompanyApiKeyService;
