import * as Yup from "yup";
import CompanyIntegrationSetting from "../../models/CompanyIntegrationSetting";
import AppError from "../../errors/AppError";

export interface UpsertCompanyIntegrationRequest {
  id?: number;
  companyId: number;
  name: string;
  provider?: string | null;
  baseUrl?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  webhookSecret?: string | null;
  metadata?: Record<string, any> | null;
  active?: boolean;
}

const schema = Yup.object().shape({
  id: Yup.number().optional(),
  companyId: Yup.number().required(),
  name: Yup.string().required(),
  provider: Yup.string().nullable(),
  baseUrl: Yup.string().url().nullable(),
  apiKey: Yup.string().nullable(),
  apiSecret: Yup.string().nullable(),
  webhookSecret: Yup.string().nullable(),
  metadata: Yup.object().nullable(),
  active: Yup.boolean().default(true)
});

const UpsertCompanyIntegrationService = async (
  params: UpsertCompanyIntegrationRequest
): Promise<CompanyIntegrationSetting> => {
  const payload = await schema.validate(params, { abortEarly: false });

  const [record] = await CompanyIntegrationSetting.upsert(payload, { returning: true });

  if (!record) {
    throw new AppError("Erro ao salvar integração.", 500);
  }

  return record;
};

export default UpsertCompanyIntegrationService;
