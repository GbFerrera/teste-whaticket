declare namespace Express {
  export interface Request {
    user: { id: string; profile: string; companyId: number; userType?: string };
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
    externalAuth?: {
      companyId: number;
      apiKeyId: number;
      webhookUrl: string | null;
      webhookSecret: string | null;
      token: string;
    };
  }
}
