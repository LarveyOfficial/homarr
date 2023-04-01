import { randomBytes } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { addSecurityEvent } from '../../../tools/events/addSecurityEvent';
import { registrationInviteCreationInputSchema } from '../../../validation/invite';
import { getServerAuthSession } from '../../../server/auth';
import { prisma } from '../../../server/db';

async function Post(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });

  if (!session) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized.',
    });
  }

  const user = await prisma?.user.findFirst({
    where: { id: session?.user?.id },
  });

  if (!user?.isAdmin) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'User does not have enough privileges.',
    });
  }

  const result = await registrationInviteCreationInputSchema.safeParseAsync(req.body);
  if (!result.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid body input.',
      data: result.error,
    });
  }

  // Generates token for registration
  const token = randomBytes(48).toString('hex');

  // Generates expiration date (7 days from now)
  const currentDate = new Date().getDate();
  const expirationDate = new Date();
  expirationDate.setDate(currentDate + 7);

  const registrationInvite = await prisma?.registrationInvite.create({
    data: {
      name: result.data.name,
      token,
      expiresAt: expirationDate,
    },
  });

  await addSecurityEvent('invite', { name: result.data.name }, user.id);

  res.status(200).json(registrationInvite);
}

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerAuthSession({ req, res });

  if (!session) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Unauthorized.',
    });
  }

  const user = await prisma?.user.findFirst({
    where: { id: session?.user?.id },
  });

  if (!user?.isAdmin) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'User does not have enough privileges.',
    });
  }

  const tokens = await prisma?.registrationInvite.findMany();

  // !!! NEVER ADD THE TOKEN TO THE RESPONSE !!!
  res.status(200).json(
    tokens?.map((token) => ({
      id: token.id,
      name: token.name,
      expiresAt: token.expiresAt,
    }))
  );
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return Post(req, res);
  }

  if (req.method === 'GET') {
    return Get(req, res);
  }

  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
