export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "48h", // Aumentado de 24h para 48h
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "90d" // Aumentado de 30d para 90d
};
