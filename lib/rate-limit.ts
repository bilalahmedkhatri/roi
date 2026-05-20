import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, "1 h"),
});