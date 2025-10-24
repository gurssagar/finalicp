// Date formatting utilities for booking data

export function formatBookingDate(timestamp: number): string {
  if (!timestamp || timestamp === 0) {
    return 'Date not set';
  }
  
  // Handle different timestamp formats
  let date: Date;
  if (timestamp > 1000000000000) {
    // Already in milliseconds
    date = new Date(timestamp);
  } else if (timestamp > 1000000000) {
    // In seconds, convert to milliseconds
    date = new Date(timestamp * 1000);
  } else {
    // In nanoseconds, convert to milliseconds
    date = new Date(timestamp / 1000000);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

export function formatBookingDateShort(timestamp: number): string {
  if (!timestamp || timestamp === 0) {
    return 'Date not set';
  }
  
  // Handle different timestamp formats
  let date: Date;
  if (timestamp > 1000000000000) {
    // Already in milliseconds
    date = new Date(timestamp);
  } else if (timestamp > 1000000000) {
    // In seconds, convert to milliseconds
    date = new Date(timestamp * 1000);
  } else {
    // In nanoseconds, convert to milliseconds
    date = new Date(timestamp / 1000000);
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeTime(timestamp: number): string {
  if (!timestamp || timestamp === 0) {
    return 'Time not set';
  }

  // Handle different timestamp formats
  let date: Date;
  if (timestamp > 1000000000000) {
    // Already in milliseconds
    date = new Date(timestamp);
  } else if (timestamp > 1000000000) {
    // In seconds, convert to milliseconds
    date = new Date(timestamp * 1000);
  } else {
    // In nanoseconds, convert to milliseconds
    date = new Date(timestamp / 1000000);
  }

  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((absDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (diff > 0) {
    // Future timestamp
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'soon';
  } else {
    // Past timestamp
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}

export function isOverdue(deadline: number): boolean {
  if (!deadline || deadline === 0) return false;
  
  // Handle different timestamp formats
  let date: Date;
  if (deadline > 1000000000000) {
    // Already in milliseconds
    date = new Date(deadline);
  } else if (deadline > 1000000000) {
    // In seconds, convert to milliseconds
    date = new Date(deadline * 1000);
  } else {
    // In nanoseconds, convert to milliseconds
    date = new Date(deadline / 1000000);
  }
  
  return new Date() > date;
}

export function getTimeRemaining(deadline: number): string {
  if (!deadline || deadline === 0) return 'No deadline set';

  // Handle different timestamp formats
  let date: Date;
  if (deadline > 1000000000000) {
    // Already in milliseconds
    date = new Date(deadline);
  } else if (deadline > 1000000000) {
    // In seconds, convert to milliseconds
    date = new Date(deadline * 1000);
  } else {
    // In nanoseconds, convert to milliseconds
    date = new Date(deadline / 1000000);
  }

  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return 'Overdue';

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  return 'Less than 1 hour remaining';
}
