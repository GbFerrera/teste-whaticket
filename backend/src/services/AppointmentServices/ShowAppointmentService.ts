import AppError from "../../errors/AppError";
import Appointment from "../../models/Appointment";
import UserSchedule from "../../models/UserSchedule";
import User from "../../models/User";
import Servico from "../../models/Servico";
import CrmClient from "../../models/CrmClient";
import Contact from "../../models/Contact";

const ShowAppointmentService = async (
  id: string | number,
  companyId: number
): Promise<Appointment> => {
  const appointment = await Appointment.findOne({
    where: { id, companyId },
    include: [
      {
        model: UserSchedule,
        as: "schedule",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "startWork", "endWork"]
          }
        ]
      },
      {
        model: Servico,
        as: "service",
        attributes: ["id", "nome", "valorOriginal", "valorComDesconto"]
      },
      {
        model: CrmClient,
        as: "client",
        attributes: ["id", "name", "email", "phone"]
      },
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number"]
      }
    ]
  });

  if (!appointment) {
    throw new AppError("Compromisso não encontrado", 404);
  }

  return appointment;
};

export default ShowAppointmentService;
