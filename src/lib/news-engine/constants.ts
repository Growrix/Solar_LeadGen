export const NEWS_ENGINE_CONSTANTS = {
  SLUG_MAX_LENGTH: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CONFIRM_TEXT: 'CONFIRM',
};

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, NEWS_ENGINE_CONSTANTS.SLUG_MAX_LENGTH);
}

export function validateConfirmText(text: string): boolean {
  return text === NEWS_ENGINE_CONSTANTS.CONFIRM_TEXT;
}
