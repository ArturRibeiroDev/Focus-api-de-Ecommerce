declare namespace Express {
  export interface Request {
    user: {
      id: int;
      role: string;
    };
  }
}

