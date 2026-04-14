import Bull, { Queue, Job } from "bull";
import {
  DISPATCH_QUEUE_REDIS_URI,
  DISPATCH_QUEUE_NAME,
  DISPATCH_QUEUE_CONCURRENCY
} from "../config/dispatchQueue";
import logger from "../utils/logger";

export interface DispatchJobData {
  logId: number;
  dispatcherId: number;
  companyId: number;
  contactId: number;
  whatsappId: number;
  template: string;
  variables: Record<string, any>;
  delayMs?: number;
}

let dispatchQueueInstance: Queue<DispatchJobData> | null = null;

export const getDispatchQueue = (): Queue<DispatchJobData> => {
  if (!dispatchQueueInstance) {
    dispatchQueueInstance = new Bull<DispatchJobData>(
      DISPATCH_QUEUE_NAME,
      DISPATCH_QUEUE_REDIS_URI
    );
  }
  return dispatchQueueInstance;
};

export const addDispatchJob = async (data: DispatchJobData, opts = {}) => {
  const queue = getDispatchQueue();
  const { delayMs, ...jobData } = data;
  return queue.add(jobData, {
    removeOnComplete: true,
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
    delay: delayMs ?? 0,
    ...opts
  });
};

export const processDispatchQueue = (
  handler: (job: Job<DispatchJobData>) => Promise<void>
) => {
  const queue = getDispatchQueue();

  queue.process(DISPATCH_QUEUE_CONCURRENCY, async job => {
    try {
      await handler(job);
    } catch (err) {
      logger.error(
        `[DispatchQueue] Job ${job.id} failed: ${(err as Error).message}`
      );
      throw err;
    }
  });

  queue.on("completed", job => {
    logger.info(`[DispatchQueue] Job ${job.id} completed`);
  });

  queue.on("failed", (job, err) => {
    logger.error(`[DispatchQueue] Job ${job?.id} failed`, err);
  });
};
