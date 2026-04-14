import SliderHome from "../../models/SliderHome";
import AppError from "../../errors/AppError";

const ShowSliderHomeService = async (id: string | number): Promise<SliderHome> => {
  const slider = await SliderHome.findByPk(id);

  if (!slider) {
    throw new AppError("Banner não encontrado", 404);
  }

  return slider;
};

export default ShowSliderHomeService;
