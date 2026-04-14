import SliderHome from "../../models/SliderHome";

interface ListRequest {
  companyId: number;
}

const ListSliderHomeService = async ({ companyId }: ListRequest): Promise<SliderHome[]> => {
  const sliders = await SliderHome.findAll({
    where: { companyId },
    order: [["createdAt", "DESC"]]
  });

  return sliders;
};

export default ListSliderHomeService;
