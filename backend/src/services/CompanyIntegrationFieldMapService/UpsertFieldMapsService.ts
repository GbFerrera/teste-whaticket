import * as Yup from "yup";
import { Op } from "sequelize";
import CompanyIntegrationFieldMap from "../../models/CompanyIntegrationFieldMap";
import CompanyIntegrationSetting from "../../models/CompanyIntegrationSetting";
import AppError from "../../errors/AppError";

interface FieldMapInput {
  id?: number;
  externalField: string;
  crmField?: string | null;
  transformExpression?: string | null;
  options?: Record<string, any> | null;
}

interface UpsertFieldMapsRequest {
  integrationId: number;
  companyId: number;
  fieldMaps: FieldMapInput[];
}

const fieldMapSchema = Yup.object().shape({
  id: Yup.number().optional(),
  externalField: Yup.string().required(),
  crmField: Yup.string().nullable(),
  transformExpression: Yup.string().nullable(),
  options: Yup.object().nullable()
});

const UpsertFieldMapsService = async ({
  integrationId,
  companyId,
  fieldMaps
}: UpsertFieldMapsRequest): Promise<CompanyIntegrationFieldMap[]> => {
  const integration = await CompanyIntegrationSetting.findOne({
    where: { id: integrationId, companyId }
  });

  if (!integration) {
    throw new AppError("Integração não encontrada.", 404);
  }

  const validatedMaps = await Promise.all(
    fieldMaps.map(async map => {
      const payload = await fieldMapSchema.validate(map, { abortEarly: false });
      return {
        integrationId,
        ...payload
      };
    })
  );

  const results = await Promise.all(
    validatedMaps.map(async map => {
      if (map.id) {
        const [, updated] = await CompanyIntegrationFieldMap.update(map, {
          where: { id: map.id, integrationId },
          returning: true
        });
        return updated[0];
      }

      return CompanyIntegrationFieldMap.create(map);
    })
  );

  const ids = results.filter(Boolean).map(record => record.id);

  await CompanyIntegrationFieldMap.destroy({
    where: {
      integrationId,
      ...(ids.length > 0
        ? {
            id: {
              [Op.notIn]: ids
            }
          }
        : {})
    }
  });

  return CompanyIntegrationFieldMap.findAll({
    where: { integrationId },
    order: [["externalField", "ASC"]]
  });
};

export default UpsertFieldMapsService;
