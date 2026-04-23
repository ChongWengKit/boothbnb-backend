import { Request, Response } from 'express';
export declare const createStripeConnectAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkStripeStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handleStripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=stripe.controller.d.ts.map