import ScheduleFollowUpService from "../FollowUpService/ScheduleFollowUpService";
import FollowUp from "../../models/FollowUp";
import { Op } from "sequelize";
import moment from "moment";

interface FollowUpNodeData {
  delayMinutes: number;
  action: {
    type: string;
    payload: any;
  };
}

class FollowUpNodeService {
  private scheduleService: ScheduleFollowUpService;

  constructor() {
    this.scheduleService = new ScheduleFollowUpService();
  }

  public async executeFollowUpNode(
    nodeData: FollowUpNodeData,
    ticketId: number,
    companyId: number,
    flowNodeId?: string
  ): Promise<void> {
    try {
      const followUp = await this.scheduleService.scheduleFollowUp({
        delayMinutes: nodeData.delayMinutes,
        action: nodeData.action,
        ticketId,
        companyId,
        flowNodeId
      });

      console.log(`Follow-up node scheduled: ${followUp.id} for ticket ${ticketId}`);
    } catch (error) {
      console.error("Error executing follow-up node:", error);
      throw error;
    }
  }

  public async cancelTicketFollowUps(ticketId: number, companyId: number): Promise<void> {
    try {
      await this.scheduleService.resetFollowUpVariables(ticketId, companyId);
      console.log(`Cancelled all follow-ups for ticket ${ticketId}`);
    } catch (error) {
      console.error("Error cancelling follow-ups:", error);
      throw error;
    }
  }

  public async getTicketFollowUps(ticketId: number, companyId: number): Promise<FollowUp[]> {
    try {
      return await this.scheduleService.getFollowUpsByTicket(ticketId, companyId);
    } catch (error) {
      console.error("Error getting follow-ups:", error);
      throw error;
    }
  }

  public async hasPendingFollowUp(ticketId: number, companyId: number): Promise<boolean> {
    try {
      const now = moment().toDate();
      const pendingFollowUp = await FollowUp.findOne({
        where: {
          ticketId,
          companyId,
          status: 'pending',
          scheduledAt: {
            [Op.gte]: now
          }
        }
      });

      return !!pendingFollowUp;
    } catch (error) {
      console.error("Error checking pending follow-up:", error);
      return false;
    }
  }
}

export default new FollowUpNodeService();
