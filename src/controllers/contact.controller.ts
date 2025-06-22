import { Request, Response } from 'express';
import { identifyUser } from '../services/contact.service';

export const identify = async (req: Request, res: Response):Promise<any> => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phoneNumber required' });
  }

  try {
    const response = await identifyUser(email, phoneNumber);
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
