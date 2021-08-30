import { Request, Response } from 'express';
import { Redis } from 'ioredis';

// merge declaration which means we add extra type to the original one
declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
};
