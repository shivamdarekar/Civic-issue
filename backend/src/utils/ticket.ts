import {prisma}  from '../lib/prisma';

/**
 * Generate unique ticket number: VMC-2026-000001
 */
export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VMC-${year}-`;

  // Get the last ticket of this year
  const lastIssue = await prisma.issue.findFirst({
    where: {
      ticketNumber: { startsWith: prefix },
    },
    orderBy: { ticketNumber: 'desc' },
    select: { ticketNumber: true },
  });

  let nextNumber = 1;
  if (lastIssue) {
    const lastNumber = parseInt(lastIssue.ticketNumber.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
}
