import UserGoogleCalendarIntegration from "../../models/UserGoogleCalendarIntegration";

export const DeleteUserGoogleCalendarIntegrationService = async (
  userId: number
): Promise<boolean> => {
  console.log("DEBUG - Deletando integração do usuário:", userId);
  
  // Buscar todas as integrações do usuário antes de deletar
  const integrations = await UserGoogleCalendarIntegration.findAll({
    where: { userId }
  });

  console.log("DEBUG - Integrações encontradas:", integrations.length);
  integrations.forEach(integration => {
    console.log("DEBUG - Integração:", {
      id: integration.id,
      email: integration.email,
      calendarId: integration.calendarId
    });
  });

  // Deletar apenas a integração pessoal do usuário (não empresariais)
  const deleted = await UserGoogleCalendarIntegration.destroy({
    where: { 
      userId,
      // Garantir que só delete integrações pessoais (sem companyId nulo)
      companyId: { [require('sequelize').Op.ne]: null }
    }
  });

  console.log("DEBUG - Integrações deletadas:", deleted);
  return deleted > 0;
};

export default DeleteUserGoogleCalendarIntegrationService;
