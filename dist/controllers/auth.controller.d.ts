import { Request, Response } from 'express';
import { ApiResponse } from '../types/types.js';
import { Role } from '../types/types.js';
import { SignInResponse } from '../types/types.js';
import { SignupData, SignupRequest } from '../types/types.js';
import { SignInRequest } from '../types/types.js';
export declare const googleSignIn: (req: Request<{
    token: string;
}>, res: Response<ApiResponse<SignInResponse>>) => Promise<Response<ApiResponse<SignInResponse>, Record<string, any>>>;
export declare const googleSignUp: (req: Request<{
    token: string;
    role: Role;
}>, res: Response<ApiResponse<SignInResponse>>) => Promise<Response<ApiResponse<SignInResponse>, Record<string, any>>>;
export declare const resetPassword: (req: Request<{
    password: string;
    token: string;
}>, res: Response<ApiResponse<{}>>) => Promise<Response<ApiResponse<{}>, Record<string, any>>>;
export declare const adminSignup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signin: (req: Request<{}, {}, SignInRequest>, res: Response<ApiResponse<SignInResponse>>) => Promise<Response<ApiResponse<SignInResponse>, Record<string, any>>>;
export declare const signup: (req: Request<{}, {}, SignupRequest>, res: Response<ApiResponse<SignupData>>) => Promise<Response<ApiResponse<SignupData>, Record<string, any>>>;
export declare const forgotPassword: (req: Request<{
    email: string;
}>, res: Response<ApiResponse<{}>>) => Promise<Response<ApiResponse<{}>, Record<string, any>>>;
export declare const verify: (req: Request, res: Response<ApiResponse<{
    authentication_token: string;
    profile_photo: string | null;
}>>) => Promise<Response<ApiResponse<{
    authentication_token: string;
    profile_photo: string | null;
}>, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map