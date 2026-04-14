// backend/src/routes/clinicChatRoutes.ts
import { Router, Request, Response } from 'express';
import { handleAppointmentRequest } from '../services/ClinicChatService';

const router = Router();

router.post('/clinic-schedule', async (req: Request, res: Response) => {
  const { patientInfo, medicId, date, time } = req.body;
  try {
    const result = await handleAppointmentRequest(patientInfo, medicId, date, time);
    res.json(result);
  } catch (error: any) {
    console.error('Erro ao agendar consulta:', error);
    res.status(500).json({ error: 'Erro interno ao agendar consulta', details: error.message });
  }
});

export default router;
