// @ts-nocheck
import ShowService from "./ShowService";

const DeleteService = async (id: number | string): Promise<void> => {
  const ferramenta = await ShowService(id);

  await ferramenta.destroy();
};

export default DeleteService;
