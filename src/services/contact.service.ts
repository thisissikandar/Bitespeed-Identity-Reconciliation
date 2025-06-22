// src/services/contact.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const identifyUser = async (email?: string, phoneNumber?: string) => {
  // Step 1: Find all contacts with matching email or phoneNumber
  const initialMatches = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email ?? undefined },
        { phoneNumber: phoneNumber ?? undefined }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  let relatedIds = new Set<number>();
  initialMatches.forEach(c => {
    relatedIds.add(c.id);
    if (c.linkedId) relatedIds.add(c.linkedId);
  });

  // Step 2: Find all contacts linked to any of the related IDs
  const allContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(relatedIds) } },
        { linkedId: { in: Array.from(relatedIds) } }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  // Step 3: Determine the primary
  const primaryContact = allContacts.find(c => c.linkPrecedence === 'PRIMARY') || null;

  if (!primaryContact) {
    const newPrimary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'PRIMARY',
        linkedId: null
      }
    });
    return buildResponse([newPrimary]);
  }

  const alreadyExists = allContacts.find(c =>
    (email && c.email === email) ||
    (phoneNumber && c.phoneNumber === phoneNumber)
  );

  if (!alreadyExists) {
    const newSecondary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'SECONDARY',
        linkedId: primaryContact.id
      }
    });
    allContacts.push(newSecondary);
  }

  return buildResponse(allContacts);
};

const buildResponse = (contacts: any[]) => {
  const primary = contacts.find(c => c.linkPrecedence === 'PRIMARY')!;

  const emails = Array.from(
    new Set([
      ...contacts.map(c => c.email).filter(Boolean)
    ])
  );

  const phoneNumbers = Array.from(
    new Set([
      ...contacts.map(c => c.phoneNumber).filter(Boolean)
    ])
  );

  const secondaryContactIds = contacts
    .filter(c => c.linkPrecedence === 'SECONDARY')
    .map(c => c.id);

  return {
    contact: {
      primaryContatctId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  };
};
