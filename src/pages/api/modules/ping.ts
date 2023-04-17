import { NextApiRequest, NextApiResponse } from 'next';
import ping from 'ping';

async function Get(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid query parameters, please specify the url',
    });
  }
  await ping.sys.probe(url, (isAlive: boolean) => {
    if (!isAlive) {
      return res.status(404).json({
        statusCode: 500,
        message: 'Host is not alive',
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'Host is alive',
    });
  });
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Filter out if the reuqest is a POST or a GET
  if (req.method === 'GET') {
    return Get(req, res);
  }
  return res.status(405).json({
    statusCode: 405,
    message: 'Method not allowed',
  });
};
