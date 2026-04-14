import { Request, Response } from "express";
import ScheduleFollowUpService from "../services/FollowUpService/ScheduleFollowUpService";
import { getIO } from "../libs/socket";

class FollowUpController {
  private scheduleService: ScheduleFollowUpService;

  constructor() {
    this.scheduleService = new ScheduleFollowUpService();
  }

  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const { delayMinutes, action, ticketId, flowNodeId } = req.body;
      const { companyId } = req.user;

      const followUp = await this.scheduleService.scheduleFollowUp({
        delayMinutes,
        action,
        ticketId,
        companyId,
        flowNodeId
      });

      const io = getIO();
      io.to(`company-${companyId}`).emit("followUp", {
        action: "create",
        followUp
      });

      return res.status(201).json(followUp);
    } catch (error) {
      console.error("Error creating follow-up:", error);
      return res.status(500).json({ error: "Error creating follow-up" });
    }
  }

  public async list(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId } = req.params;
      const { companyId } = req.user;

      const followUps = await this.scheduleService.getFollowUpsByTicket(
        Number(ticketId),
        companyId
      );

      return res.json(followUps);
    } catch (error) {
      console.error("Error listing follow-ups:", error);
      return res.status(500).json({ error: "Error listing follow-ups" });
    }
  }

  public async cancel(req: Request, res: Response): Promise<Response> {
    try {
      const { followUpId } = req.params;
      const { companyId } = req.user;

      await this.scheduleService.cancelFollowUp(Number(followUpId), companyId);

      const io = getIO();
      io.to(`company-${companyId}`).emit("followUp", {
        action: "cancel",
        followUpId: Number(followUpId)
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Error cancelling follow-up:", error);
      return res.status(500).json({ error: "Error cancelling follow-up" });
    }
  }

  public async resetTicket(req: Request, res: Response): Promise<Response> {
    try {
      const { ticketId } = req.params;
      const { companyId } = req.user;

      await this.scheduleService.resetFollowUpVariables(Number(ticketId), companyId);

      const io = getIO();
      io.to(`company-${companyId}`).emit("followUp", {
        action: "reset",
        ticketId: Number(ticketId)
      });

      return res.status(204).send();
    } catch (error) {
      console.error("Error resetting follow-ups:", error);
      return res.status(500).json({ error: "Error resetting follow-ups" });
    }
  }

  public async processPending(req: Request, res: Response): Promise<Response> {
    try {
      await this.scheduleService.processPendingFollowUps();
      return res.status(200).json({ message: "Pending follow-ups processed" });
    } catch (error) {
      console.error("Error processing follow-ups:", error);
      return res.status(500).json({ error: "Error processing follow-ups" });
    }
  }
}

export default new FollowUpController();
