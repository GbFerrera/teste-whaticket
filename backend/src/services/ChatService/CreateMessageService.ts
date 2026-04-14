import { Op } from "sequelize";
import Chat from "../../models/Chat";
import ChatMessage from "../../models/ChatMessage";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";
import fs from "fs";
import path from "path";

export interface ChatMessageData {
  senderId: number;
  chatId: number;
  message: string;
  medias?: Express.Multer.File[];
}

export default async function CreateMessageService({
  senderId,
  chatId,
  message,
  medias
}: ChatMessageData) {
  let mediaPath = "";
  let mediaName = "";

  // Processar mídia se existir
  if (medias && medias.length > 0) {
    const media = medias[0];
    const dir = path.join(__dirname, "..", "..", "..", "public", "chat-media");

    // Garantir que o diretório existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Criar nome de arquivo único
    mediaName = `${new Date().getTime()}-${media.originalname.replace(
      /\s/g,
      "_"
    )}`;
    const filePath = path.join(dir, mediaName);

    // Salvar arquivo
    fs.writeFileSync(filePath, media.buffer);

    // Definir caminho da mídia para salvar no banco de dados
    mediaPath = `/chat-media/${mediaName}`;
  }

  const newMessage = await ChatMessage.create({
    senderId,
    chatId,
    message,
    mediaPath,
    mediaName
  });

  await newMessage.reload({
    include: [
      { model: User, as: "sender", attributes: ["id", "name"] },
      {
        model: Chat,
        as: "chat",
        include: [{ model: ChatUser, as: "users" }]
      }
    ]
  });

  const sender = await User.findByPk(senderId);

  await newMessage.chat.update({ lastMessage: `${sender.name}: ${message}` });

  const chatUsers = await ChatUser.findAll({
    where: { chatId }
  });

  for (let chatUser of chatUsers) {
    if (chatUser.userId === senderId) {
      await chatUser.update({ unreads: 0 });
    } else {
      await chatUser.update({ unreads: chatUser.unreads + 1 });
    }
  }

  return newMessage;
}
