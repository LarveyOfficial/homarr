import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { registerSchema } from '../../../validation/auth';
import { addSecurityEvent } from '../../../tools/events/addSecurityEvent';
import { prisma } from '../../../server/db';

const SALT_ROUNDS = 10;

const Post = async (req: NextApiRequest, res: NextApiResponse) => {
  const result = await registerSchema.safeParseAsync(req.body);
  if (!result.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid body input.',
      data: result.error,
    });
  }

  const { username, password, token } = result.data;

  const existingUser = await prisma?.user.findFirst({
    where: {
      username,
    },
  });

  if (existingUser) {
    return res.status(409).json({
      code: 'CONFLICT',
      message: 'User already exists.',
    });
  }

  const registrationInvite = await prisma?.registrationInvite.findFirst({
    where: {
      token,
    },
  });

  if (!registrationInvite || registrationInvite.expiresAt <= new Date()) {
    return res.status(401).json({
      code: 'FORBIDDEN',
      message: 'Invalid token.',
    });
  }

  await prisma?.registrationInvite.delete({
    where: {
      id: registrationInvite.id,
    },
  });

  const user = await prisma?.user.create({
    data: { username, password: hashPassword(password) },
  });

  await addSecurityEvent('register', { inviteName: registrationInvite.name }, user?.id ?? null);

  return res.status(201).json({
    message: 'Account created successfully.',
    result: { username },
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return Post(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};
