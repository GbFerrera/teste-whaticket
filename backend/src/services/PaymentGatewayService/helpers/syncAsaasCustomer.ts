import axios from "axios";
import CrmClient from "../../../models/CrmClient";
import AppError from "../../../errors/AppError";

interface SyncCustomerParams {
  client: CrmClient;
  token: string;
}

const ASAAS_BASE_URL = "https://api.asaas.com/v3";

const buildCustomerPayload = (client: CrmClient) => {
  if (!client.name && !client.companyName) {
    throw new AppError("Cliente sem nome para cadastro no Asaas.", 400);
  }

  const payload: Record<string, any> = {
    name: client.name || client.companyName,
    cpfCnpj: client.document || undefined,
    email: client.email || undefined,
    phone: client.phone || undefined,
    mobilePhone: client.phone || undefined,
    address: client.address || undefined,
    addressNumber: client.number || undefined,
    complement: client.complement || undefined,
    province: client.neighborhood || undefined,
    city: client.city || undefined,
    state: client.state || undefined,
    postalCode: client.zipCode || undefined,
    externalReference: String(client.id)
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      delete payload[key];
    }
  });

  return payload;
};

const syncAsaasCustomer = async ({
  client,
  token
}: SyncCustomerParams): Promise<string> => {
  const headers = {
    "Content-Type": "application/json",
    access_token: token
  };

  const payload = buildCustomerPayload(client);

  if (client.asaasCustomerId) {
    try {
      await axios.put(
        `${ASAAS_BASE_URL}/customers/${client.asaasCustomerId}`,
        payload,
        { headers }
      );
      return client.asaasCustomerId;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  const response = await axios.post(`${ASAAS_BASE_URL}/customers`, payload, {
    headers
  });

  const customerId = response.data?.id;

  if (!customerId) {
    throw new AppError("Asaas não retornou o ID do cliente.", 400);
  }

  await client.update({ asaasCustomerId: customerId });

  return customerId;
};

export default syncAsaasCustomer;
