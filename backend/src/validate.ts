export const TASK_STATUSES = ['planning', 'in_progress', 'completed'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const;
export const TICKET_CATEGORIES = ['Hardware', 'Software', 'Netzwerk', 'Berechtigungen'] as const;

export const isOneOf = (value: unknown, allowed: readonly string[]): boolean =>
  typeof value === 'string' && allowed.includes(value);
