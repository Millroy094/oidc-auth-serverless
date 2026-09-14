import { Request, Response } from 'express';
import HTTP_STATUSES from '../constants/http-status.ts';

class HealthCheckController {
  public static async getStatus(req: Request, res: Response) {
    res.status(HTTP_STATUSES.ok).send({ status: 'ok' });
  }
}

export default HealthCheckController;
