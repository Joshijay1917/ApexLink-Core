import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: string | any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Not authorized, no token');
    }
    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      throw new ApiError(401, 'Not authorized, token failed');
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    if(error?.message === "jwt expired") {
      throw new ApiError(401, "Unauthorized access!")
    }
    next(error);
  }
};
