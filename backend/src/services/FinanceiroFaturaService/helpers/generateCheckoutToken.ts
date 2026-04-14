import { randomBytes } from "crypto";
import FinanceiroFatura from "../../../models/FinanceiroFatura";

const generateCheckoutToken = async (): Promise<string> => {
  let token: string;
  let exists = true;

  do {
    token = randomBytes(16).toString("hex");
    const count = await FinanceiroFatura.count({ where: { checkoutToken: token } });
    exists = count > 0;
  } while (exists);

  return token;
};

export default generateCheckoutToken;
