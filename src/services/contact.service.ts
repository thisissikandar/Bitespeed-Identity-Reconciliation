import { findContacts, createContact, updateContactLink } from '../models/contact.model';
import { Contact } from '@prisma/client';

export const identifyUser = async (email?: string, phoneNumber?: string) => {
  const existingContacts = await findContacts(email || '', phoneNumber || '');
  let allContacts: Contact[] = [...existingContacts];

  // Determine primary
  const primary = allContacts.find(c => c.linkPrecedence === 'PRIMARY');

  if (!primary) {
    const newPrimary = await createContact(email || null, phoneNumber || null, null, 'PRIMARY');
    return buildResponse([newPrimary]);
  }

  // If new contact data not fully in existing records, create new secondary
  const hasEmail = allContacts.some(c => c.email === email);
  const hasPhone = allContacts.some(c => c.phoneNumber === phoneNumber);

  if (!(hasEmail && hasPhone)) {
    const newSecondary = await createContact(email || null, phoneNumber || null, primary.id, 'SECONDARY');
    allContacts.push(newSecondary);
  }

  return buildResponse(allContacts);
};

const buildResponse = (contacts: Contact[]) => {
  const primaryContact = contacts.find(c => c.linkPrecedence === 'PRIMARY')!;
  const emails = Array.from(new Set([primaryContact.email, ...contacts.map(c => c.email).filter(Boolean)]));
  const phones = Array.from(new Set([primaryContact.phoneNumber, ...contacts.map(c => c.phoneNumber).filter(Boolean)]));
  const secondaryIds = contacts.filter(c => c.linkPrecedence === 'SECONDARY').map(c => c.id);

  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails,
      phoneNumbers: phones,
      secondaryContactIds: secondaryIds
    }
  };
};
