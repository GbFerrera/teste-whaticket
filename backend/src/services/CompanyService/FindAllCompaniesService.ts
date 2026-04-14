import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Setting from "../../models/Setting";
import User from "../../models/User";

const FindAllCompanyService = async (): Promise<Company[]> => {
  const companies = await Company.findAll({
    order: [["name", "ASC"]],
    include: [
      { model: Plan, as: "plan", attributes: ["id", "name", "amount"] },
      { model: Setting, as: "settings" },
      { 
        model: User, 
        as: "users", 
        attributes: ["id", "name", "email", "profile"],
        where: { profile: "admin" },
        required: false
      }
    ]
  });
  return companies;
};

export default FindAllCompanyService;
