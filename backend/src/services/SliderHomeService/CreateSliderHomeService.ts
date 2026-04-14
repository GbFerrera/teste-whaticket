import SliderHome from "../../models/SliderHome";
import AppError from "../../errors/AppError";

interface CreateRequest {
  name: string;
  image: string;
  companyId: number;
}

const CreateSliderHomeService = async ({ name, image, companyId }: CreateRequest): Promise<SliderHome> => {
  if (companyId !== 1) {
    throw new AppError("Apenas a empresa mestre pode criar banners", 403);
  }

  const slider = await SliderHome.create({ name, image, companyId });
  return slider;
};

export default CreateSliderHomeService;
