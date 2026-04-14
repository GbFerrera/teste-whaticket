// @ts-nocheck
import ShowService from "./ShowService";

const DeleteService = async (id: number | string, companyId: number): Promise<void> => {
  const negocio = await ShowService(id, companyId);

  await negocio.destroy();
};

export default DeleteService;
