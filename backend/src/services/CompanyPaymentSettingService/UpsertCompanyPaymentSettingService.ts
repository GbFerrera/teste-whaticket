import * as Yup from "yup";
import CompanyPaymentSetting from "../../models/CompanyPaymentSetting";
import AppError from "../../errors/AppError";

interface UpsertRequest {
  id?: number;
  companyId: number;
  provider: "asaas" | "mercadopago";
  token: string;
  additionalData?: Record<string, any>;
  active?: boolean;
}

const schema = Yup.object().shape({
  id: Yup.number().optional(),
  companyId: Yup.number().required(),
  provider: Yup.mixed<"asaas" | "mercadopago">()
    .oneOf(["asaas", "mercadopago"])
    .required(),
  token: Yup.string().required(),
  additionalData: Yup.object().nullable(),
  active: Yup.boolean().default(true)
});

const UpsertCompanyPaymentSettingService = async ({
  id,
  companyId,
  provider,
  token,
  additionalData,
  active = true
}: UpsertRequest): Promise<CompanyPaymentSetting> => {
  const payload = await schema.validate(
    { id, companyId, provider, token, additionalData, active },
    { abortEarly: false }
  );

  const [record] = await CompanyPaymentSetting.upsert(
    {
      ...payload
    },
    { returning: true }
  );

  if (!record) {
    throw new AppError("Erro ao salvar configuração de pagamento.", 500);
  }

  return record;
};

export default UpsertCompanyPaymentSettingService;
