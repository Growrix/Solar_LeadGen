export function isValidConfirmText(typed: unknown, required: string): boolean {
  if (typeof typed !== 'string') return false;
  return typed.trim() === required;
}
