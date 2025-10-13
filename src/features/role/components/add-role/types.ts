export const AVAILABLE_ACTIONS = [
  'read',
  'create',
  'update',
  'delete'
] as const;

export type Action = (typeof AVAILABLE_ACTIONS)[number];

export type Permission = {
  resource: string;
  actions: Action[];
};
