import { prisma } from '../db/prisma';

export const findContacts = async (email?: string, phoneNumber?: string) => {
  return prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const createContact = async (
  email: string | null,
  phoneNumber: string | null,
  linkedId: number | null,
  linkPrecedence: 'PRIMARY' | 'SECONDARY'
) => {
  return prisma.contact.create({
    data: {
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId,
      linkPrecedence,
    }
  });
};

export const updateContactLink = async (id: number, linkedId: number) => {
  return prisma.contact.update({
    where: { id },
    data: {
      linkedId,
      linkPrecedence: 'SECONDARY'
    }
  });
};
