import SliderHome from "../../models/SliderHome";
import AppError from "../../errors/AppError";

interface DeleteRequest {
  id: string | number;
  companyId: number;
}

const DeleteSliderHomeService = async ({ id, companyId }: DeleteRequest): Promise<void> => {
  if (companyId !== 1) {
    throw new AppError("Apenas a empresa mestre pode remover banners", 403);
  }

  const slider = await SliderHome.findByPk(id);

  if (!slider) {
    throw new AppError("Banner não encontrado", 404);
  }

  await slider.destroy();
};

export default DeleteSliderHomeService;
