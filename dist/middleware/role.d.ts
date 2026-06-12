import { Response, NextFunction } from 'express';
export declare const isHost: (req: any, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const isVendor: (req: any, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const isAdmin: (req: any, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=role.d.ts.map