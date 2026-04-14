import SliderHome from "../../models/SliderHome";
import AppError from "../../errors/AppError";

interface UpdateRequest {
  id: string | number;
  name?: string;
  image?: string;
  companyId: number;
}

const UpdateSliderHomeService = async ({ id, name, image, companyId }: UpdateRequest): Promise<SliderHome> => {
  if (companyId !== 1) {
    throw new AppError("Apenas a empresa mestre pode atualizar banners", 403);
  }

  const slider = await SliderHome.findByPk(id);

  if (!slider) {
    throw new AppError("Banner não encontrado", 404);
  }

  await slider.update({
    name: name ?? slider.name,
    image: image ?? slider.image
  });

  return slider;
};

export default UpdateSliderHomeService;
