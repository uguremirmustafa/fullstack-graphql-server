import { IDatabaseDriver, Connection, EntityManager } from '@mikro-orm/core';
import { Request, Response } from 'express';

// merge declaration which means we add extra type to the original one
declare module 'express-session' {
  interface Session {
    userId: number;
  }
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
  res: Response;
};
