import { Request, Response } from 'express';
export declare const handleResendWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getEmailLogs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendEmail: (req: Request<{
    logId: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=mail.controller.d.ts.map