/**
 * Calculate SLA target date based on category SLA hours
 */
export function calculateSlaTarget(createdAt: Date, slaHours: number): Date {
  // Use milliseconds to support SLA > 24 hours correctly
  return new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
}

/**
 * Check if SLA is breached
 */
export function isSlaBreached(slaTargetAt: Date, resolvedAt?: Date | null): boolean {
  const checkDate = resolvedAt || new Date();
  return checkDate > slaTargetAt;
}

/**
 * Calculate SLA compliance percentage
 */
export function calculateSlaCompliance(
  totalResolved: number,
  resolvedWithinSla: number
): number {
  if (totalResolved === 0) return 100;
  return Math.round((resolvedWithinSla / totalResolved) * 100 * 100) / 100;
}

/**
 * Get time remaining until SLA breach
 */
export function getTimeToSla(slaTargetAt: Date): {
  isBreached: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
} {
  const now = new Date();
  const diff = slaTargetAt.getTime() - now.getTime();
  const isBreached = diff < 0;
  
  const absDiff = Math.abs(diff);
  const hoursRemaining = Math.floor(absDiff / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    isBreached,
    hoursRemaining,
    minutesRemaining,
  };
}
