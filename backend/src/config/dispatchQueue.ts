export const DISPATCH_QUEUE_REDIS_URI =
  process.env.DISPATCH_QUEUE_REDIS_URI || process.env.REDIS_URI || "";

export const DISPATCH_QUEUE_NAME =
  process.env.DISPATCH_QUEUE_NAME || "ScheduledDispatchQueue";

export const DISPATCH_QUEUE_CONCURRENCY = Number(
  process.env.DISPATCH_QUEUE_CONCURRENCY || 1
);
