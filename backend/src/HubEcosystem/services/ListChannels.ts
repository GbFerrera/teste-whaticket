import { showHubToken } from "../helpers/showHubToken";
const { Client } = require("notificamehubsdk");
require("dotenv").config();

const ListChannels = async (companyId: string) => {
  try {
    const notificameHubToken = await showHubToken(companyId);

    if (!notificameHubToken) {
      throw new Error("NOTIFICAMEHUB_TOKEN_NOT_FOUND");
    }

    const client = new Client(notificameHubToken);

    const response = await client.listChannels();
    return response;
  } catch (error) {
    throw new Error(error.body.message);
  }
};

export default ListChannels;
