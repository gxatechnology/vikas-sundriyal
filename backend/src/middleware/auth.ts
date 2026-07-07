import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: Role;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlogisticserpjwttokenkey123!';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: Role };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of these roles: ${roles.join(', ')}` });
    }

    next();
  };
};
