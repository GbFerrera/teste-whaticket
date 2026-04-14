import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import stringSimilarity from "string-similarity";
// import multer from 'multer';

import formatBody from "../../helpers/Mustache";
import Contact from "../../models/Contact";
import { default as Setting } from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from '../../models/Whatsapp';
import UpdateTicketService from "../../services/TicketServices/UpdateTicketService";
import { TypebotService } from "../services/TypebotServices";
import ListUserQueueServices from "../../services/UserQueueServices/ListUserQueueServices";
import type { IContent } from '../services/HubMessageListener';
import { SendMediaMessageService } from '../services/SendMediaMessageService';
import { SendTextMessageService } from '../services/SendTextMessageService';

export async function verifyChatbot(
  connection: Whatsapp,
  contents: IContent[],
  ticket: Ticket,
  contact: Contact
) {
  const { queues, maxUseBotQueues } = connection;
  const selectedOption = contents[0]?.text;

  if (
    maxUseBotQueues &&
    maxUseBotQueues !== 0 &&
    ticket.amountUsedBotQueues >= maxUseBotQueues
  ) {
    const whats = await Whatsapp.findByPk(ticket.whatsappId);
    if (whats.maxUseBotQueues && whats.maxUseBotQueues != null && whats.maxUseBotQueues > 0) {
      UpdateTicketService({
        ticketData: { queueId: whats.maxUseBotQueues },
        ticketId: ticket.id,
        companyId: ticket.companyId
      })
    }
    return;
  }

  if (contact.disableBot) {
    return;
  }

  const chosenQueue = queues[+selectedOption - 1];
  const buttonActive = await Setting.findOne({
    where: { key: "chatBotType", companyId: ticket.companyId }
  });
  const typeBot = buttonActive?.value || "text";
  let randomUserId;

  if (chosenQueue) {
    try {
      const userQueue = await ListUserQueueServices(chosenQueue.id);
      if (userQueue.userId > -1) {
        randomUserId = userQueue.userId;
      }
    } catch (error) {
      console.error(error);
    }
  }

  let settingsUserRandom = await Setting.findOne({
    where: { key: "userRandom", companyId: ticket.companyId }
  });

  const queueValues = queues.map(queue => queue.name);
  const queueId = queues.map(queue => queue.id);
  const nome = contact.name;
  const numero = contact.number;
  const receivedMessage = contents[0]?.text;

  const typeBotIn = async () => {
    try {
      const resetFlux = await Setting.findOne({
        where: {
          key: "apiKeyTypeBot",
          companyId: ticket.companyId
        }
      });

      const urlTypeBot = await Setting.findOne({
        where: {
          key: "urlTypeBot",
          companyId: ticket.companyId
        }
      });

      const nameTypeBot = await Setting.findOne({
        where: {
          key: "viewerTypeBot",
          companyId: ticket.companyId
        }
      });

      const apiUrl = urlTypeBot?.value;
      const token = nameTypeBot?.value;

      if (!apiUrl || !token) {
        if (!apiUrl) {
          console.error("Url Inválido ou não fornecido");
        }
        if (!token) {
          console.error("Nome Inválido ou não fornecido");
        }
        return;
      }

      const typebotService = new TypebotService(apiUrl, token);

      let startChatResponse;

      const ticketId = ticket.id;
      const publicId = token; // Substitua pelo valor correto

      const foundQueue = queues.find(queue => {
        const similarity = stringSimilarity.compareTwoStrings(
          queue.name.toLowerCase(),
          receivedMessage.toLowerCase()
        );

        // Defina um limite de similaridade que considera aceitável
        const similarityThreshold = 0.5; // Pode ajustar conforme necessário

        return similarity >= similarityThreshold;
      });

      let foundQueueError = false;

      if (foundQueue) {
        const foundQueueId = foundQueue.id;
        console.log(
          `Fila encontrada - Nome: ${foundQueue.name}, ID: ${foundQueueId}`
        );

        // Chame a função UpdateTicketService com o ID da fila
        await UpdateTicketService({
          ticketData: { queueId: foundQueueId },
          ticketId: ticket.id,
          companyId: ticket.companyId,
        });

        await ticket.update({
          typebotSessionId: null
        });

        const delayInMilliseconds = 3000; // 1 segundo
        await new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
        const body = formatBody(`${foundQueue.greetingMessage}`, ticket);

        await SendTextMessageService(
          body,
          ticket.id,
          ticket.contact,
          ticket.whatsapp
        );
      } else {
        if (receivedMessage === resetFlux?.value) {
          console.log("Reiniciando Fluxo no TypeBot");
          startChatResponse = await typebotService.startChat(
            token,
            receivedMessage,
            queueValues,
            nome,
            numero,
            ticketId
          );

          await ticket.update({
            typebotSessionId: startChatResponse.sessionId
          });

        } else {
          console.log("Verificando Se Fluxo Existe No TypeBot");
          try {
            // Tente chamar continueChat
            startChatResponse = await typebotService.continueChat(
              ticket.typebotSessionId,
              receivedMessage
            );
          } catch (continueChatError) {
            // Se houver um erro no continueChat, chame startChat
            console.error(
              "Erro ao continuar o TypeBot. Iniciando um novo TypeBot.",
              continueChatError
            );
            console.log("Criando Novo Fluxo No TypeBot");
            startChatResponse = await typebotService.startChat(
              token,
              receivedMessage,
              queueValues,
              nome,
              numero,
              ticketId
            );
            // Atualize o typebotToken no objeto Contact correspondente
            await ticket.update({
              typebotSessionId: startChatResponse.sessionId
            });
          }
        }

        const messages = startChatResponse.messages;

        for (const message of messages) {
          // Verifica se o ID da mensagem está presente em lastBubbleBlockId
          let matchingAction;

          try {
            matchingAction = startChatResponse.clientSideActions.find(
              action => action.lastBubbleBlockId === message.id
            );

            if (matchingAction) {
              const secondsToWait = matchingAction.wait?.secondsToWaitFor || 0;
              console.log(
                `Bloco de espera encontrado: ${matchingAction.lastBubbleBlockId}`
              );
              console.log(`Espere por ${secondsToWait} segundos...`);
              await wait(secondsToWait);
            }
          } catch (matchingActionError) {
            try {
              console.log("Nenhum Bloco de espera encontrado");
            } catch (nestedError) {
              console.log("Prosseguindo");
            }
            // Lidar com o erro, se necessário, ou apenas continuar a execução
          }

          if (message.type === "text") {
            let formattedText = "";

            for (const richText of message.content.richText) {
              for (const element of richText.children) {
                let text = "";
                let isBold = false;

                if (element.text) {
                  text = element.text;
                  isBold = element.bold || isBold;
                } else if (
                  element.type === "inline-variable" &&
                  element.children[0]?.children[0]?.text
                ) {
                  const inlineText = element.children[0].children[0].text;
                  text = inlineText;
                  isBold = element.bold || isBold;
                } else if (element.type === "a") {
                  // Manipula o elemento de link
                  //const linkText = element.children[0].text;
                  const linkUrl = element.url;
                  text += `${linkUrl}`;
                } else if (element.type === "p") {
                  for (const childElement of element.children) {
                    if (childElement.text) {
                      if (childElement.bold) {
                        text += `*${childElement.text}*`;
                      } else {
                        text += childElement.text;
                      }
                    } else if (childElement.type === "a") {
                      // Manipula o elemento de link dentro do parágrafo
                      const linkUrl = childElement.url;
                      text += `${linkUrl}`;
                    }
                  }
                }

                if (isBold) {
                  text = `*${text}*`;
                }
                if (element.italic) {
                  text = `_${text}_`;
                }
                if (element.underline) {
                  text = `~${text}~`;
                }

                formattedText += text;
              }

              formattedText += "\n";
            }

            formattedText = formattedText.replace(/\n$/, "");

            const delayInMilliseconds = 2000; // 2 seconds
            await new Promise(resolve =>
              setTimeout(resolve, delayInMilliseconds)
            );

            await SendTextMessageService(
              formattedText,
              ticket.id,
              ticket.contact,
              ticket.whatsapp
            )
          }

          if (message.type === "image") {
            console.log(`url da imagem: ${message.content?.url}`);
            try {
              const url = message.content?.url;

              // Baixar a imagem da URL e salvar localmente
              const response = await axios.get(url, { responseType: 'stream' });
              const imageStream = response.data;
              const mimetype = response.headers['content-type'];
              const [, extension] = mimetype.split('/');
              const localFilePath = `./public/company${ticket.companyId
                }/${makeid(10)}.${extension}`;
              const fileStream = fs.createWriteStream(localFilePath);
              const filename = localFilePath.substring(
                localFilePath.lastIndexOf("/") + 1
              );

              await imageStream.pipe(fileStream);

              const media = {
                fieldname: undefined,
                originalname: undefined,
                encoding: '7bit',
                size: undefined,
                stream: undefined,
                destination: path.join(__dirname, "public", `company${ticket.companyId}`),
                buffer: undefined,
                path: path.resolve(localFilePath),
                filename,
                mimetype,
              }

              await SendMediaMessageService(
                media,
                '',
                ticket.id,
                ticket.contact,
                ticket.whatsapp,
                true
              );
            } catch (e) {
              console.error(e);
            }
          }

          // if (message.type === "video") {
          //   console.log(`url do video: ${message.content?.url}`);
          //   try {
          //     const url = message.content?.url; // URL da imagem
          //     const caption = ""; // Substitua pela legenda desejada
          //     const localFilePath = `./public/company${
          //       ticket.companyId
          //     }/${makeid(10)}`;

          //     const fileName = localFilePath.substring(
          //       localFilePath.lastIndexOf("/") + 1
          //     );

          //     // await wbot.sendMessage(
          //     //   `${contact.number}@${
          //     //     ticket.isGroup ? "g.us" : "s.whatsapp.net"
          //     //   }`,
          //     //   {
          //     //     video: url
          //     //       ? { url }
          //     //       : fs.readFileSync(
          //     //           `./public/company${
          //     //             ticket.companyId
          //     //           }/${fileName}-${makeid(10)}`
          //     //         ),
          //     //     fileName: caption,
          //     //     caption: caption
          //     //     //mimetype: 'image/jpeg'
          //     //   }
          //     // );
          //   } catch (e) {}
          // }

          // if (message.type === "audio") {
          //   console.log(`url do audio: ${message.content?.url}`);
          //   try {
          //     const url = message.content?.url; // URL do arquivo de áudio
          //     const caption = ""; // Substitua pela legenda desejada
          //     const localFilePath = `./public/company${
          //       ticket.companyId
          //     }/${makeid(10)}.mp3`; // Nome do arquivo local

          //     // Baixar o arquivo de áudio da URL e salvar localmente
          //     const response = await axios.get(url, { responseType: "stream" });
          //     const audioStream = response.data;
          //     const fileStream = fs.createWriteStream(localFilePath);

          //     audioStream.pipe(fileStream);

          //     await new Promise((resolve, reject) => {
          //       fileStream.on("finish", resolve);
          //       fileStream.on("error", reject);
          //     });

          //     // await wbot.sendPresenceUpdate("recording", msg.key.remoteJid);
          //     // const delayInMilliseconds = 10000; // 1 segundo
          //     // await new Promise(resolve =>
          //     //   setTimeout(resolve, delayInMilliseconds)
          //     // );
          //     // await wbot.sendMessage(
          //     //   `${contact.number}@${
          //     //     ticket.isGroup ? "g.us" : "s.whatsapp.net"
          //     //   }`,
          //     //   {
          //     //     audio: fs.readFileSync(localFilePath),
          //     //     fileName: caption,
          //     //     caption: caption,
          //     //     mimetype: "audio/mp4", // Defina o tipo de mídia correto para arquivos de áudio
          //     //     ptt: true
          //     //   }
          //     // );
          //     // wbot.sendPresenceUpdate("available", msg.key.remoteJid);

          //     // Excluir o arquivo local após o envio (se necessário)
          //     // fs.unlinkSync(localFilePath);
          //   } catch (e) {
          //     console.error(e);
          //   }
          // }

          async function wait(seconds) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
          }
        }

        const input = startChatResponse.input;

        if (input && input.type === "choice input") {
          let formattedText = "";
          const items = input.items;

          for (const item of items) {
            formattedText += `▶️ ${item.content}\n`;
          }

          formattedText = formattedText.replace(/\n$/, "");

          await SendTextMessageService(
            formattedText,
            ticket.id,
            ticket.contact,
            ticket.whatsapp
          );
        }
      }
      if (foundQueueError) {
        // Se houve um erro na busca da fila, não execute este bloco
        return;
      }
    } catch (error) {
      // Trate qualquer erro que possa ocorrer durante a chamada da API
      console.error("Erro ao iniciar o chat:", error);
    }
  };

  if (typeBot === "typeBot") {
    return typeBotIn();
  }
};

export function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}