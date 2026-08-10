import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const login = async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        message: 'Invalid input',
        code: 'VALIDATION_ERROR',
        details: parseResult.error.flatten(),
      },
    });
  }

  const { email, password } = parseResult.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({
      error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
    });
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({
      error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
    });
  }

  const token = signToken({ userId: user.id, role: user.role });

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const me = async (req: Request & { user?: any }, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({
      error: { message: 'User not found', code: 'NOT_FOUND' },
    });
  }

  return res.status(200).json({ user });
};