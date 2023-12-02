import { verifyKey } from 'discord-interactions';
import { Request, Response } from 'express';

export const getDiscordRequestVerifier = (clientKey: string) => {
  return (request: Request, response: Response, buffer: Buffer) => {
    const signature = request.get('X-Signature-Ed25519');
    const timestamp = request.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buffer, signature, timestamp, clientKey);
    if (!isValidRequest) {
      response.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
};
