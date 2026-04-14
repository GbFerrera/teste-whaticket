import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import User from "../models/User";
import UserDevice from "../models/UserDevice";
import Contact from "../models/Contact";

// Modelo para dispositivos móveis dos usuários
interface UserDeviceData {
  userId: number;
  deviceToken: string;
  platform: 'ios' | 'android';
  createdAt: Date;
  updatedAt: Date;
}

// Serviço para registrar dispositivo móvel para notificações
export const registerDevice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { deviceToken, platform } = req.body;
    const userId = req.user.id;

    if (!deviceToken || !platform) {
      throw new Error("ERR_MISSING_DEVICE_INFO");
    }

    // Verificar se já existe dispositivo registrado
    const existingDevice = await UserDevice.findOne({
      where: { userId, deviceToken }
    });

    if (existingDevice) {
      // Atualizar dispositivo existente
      await existingDevice.update({ platform, updatedAt: new Date() });
    } else {
      // Criar novo registro de dispositivo
      await UserDevice.create({
        userId,
        deviceToken,
        platform,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return res.status(200).json({ success: true, message: "Device registered successfully" });
  } catch (error) {
    console.error("Error registering device:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Serviço para remover dispositivo
export const unregisterDevice = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user.id;

    await UserDevice.destroy({
      where: { userId, deviceToken }
    });

    return res.status(200).json({ success: true, message: "Device unregistered successfully" });
  } catch (error) {
    console.error("Error unregistering device:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Função para enviar notificação push para dispositivos móveis
export const sendPushNotification = async (
  userId: number,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    // Buscar dispositivos do usuário
    const devices = await UserDevice.findAll({
      where: { userId }
    });

    if (devices.length === 0) {
      return;
    }

    // Agrupar dispositivos por plataforma
    const androidDevices = devices.filter(d => d.platform === 'android').map(d => d.deviceToken);
    const iosDevices = devices.filter(d => d.platform === 'ios').map(d => d.deviceToken);

    // Enviar notificações (implementar com Firebase Cloud Messaging ou similar)
    if (androidDevices.length > 0) {
      // Implementar envio para Android
      console.log(`Sending push notification to Android devices: ${androidDevices.join(', ')}`);
    }

    if (iosDevices.length > 0) {
      // Implementar envio para iOS
      console.log(`Sending push notification to iOS devices: ${iosDevices.join(', ')}`);
    }

  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

// Middleware para enviar notificação quando nova mensagem chega
export const notifyNewMessage = async (message: any): Promise<void> => {
  try {
    // Buscar ticket e usuário associado
    const ticket = await Ticket.findByPk(message.ticketId, {
      include: [
        { model: User, as: 'user' },
        { model: Contact, as: 'contact' }
      ]
    });

    if (!ticket || !ticket.user) {
      return;
    }

    // Enviar notificação push
    await sendPushNotification(
      ticket.user.id,
      `Nova mensagem de ${ticket.contact?.name || 'Contato'}`,
      message.body || 'Nova mensagem',
      {
        ticketId: ticket.id,
        messageId: message.id,
        contactId: ticket.contactId
      }
    );

    // Emitir evento WebSocket para web
    const io = getIO();
    io.of(ticket.companyId.toString()).emit(`company-${ticket.companyId}-message`, {
      action: "create",
      message,
      ticket: {
        id: ticket.id,
        userId: ticket.userId,
        contactId: ticket.contactId
      }
    });

  } catch (error) {
    console.error("Error notifying new message:", error);
  }
};
