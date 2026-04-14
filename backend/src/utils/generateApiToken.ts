import { randomBytes } from "crypto";

export const generateApiToken = (size = 48): string => {
  return randomBytes(size).toString("hex");
};

export default generateApiToken;
