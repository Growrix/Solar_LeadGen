// Message catalog for notification system
// Centralized, role-aware, user-friendly copy

export type MessageKey =
  // Homeowner messages (service-friendly tone)
  | 'homeowner.request.received'
  | 'homeowner.responses.available'
  | 'homeowner.selection.confirmed'
  | 'homeowner.appointment.suggested'
  // Installer messages (professional tone)
  | 'installer.new.opportunity'
  | 'installer.bid.won'
  | 'installer.bid.outcome.other'
  | 'installer.data.update'
  // Admin messages (operational tone)
  | 'admin.assignment.started'
  | 'admin.assignment.ended'
  | 'admin.config.updated';

export const MESSAGE_CATALOG: Record<MessageKey, { title: string; message: string }> = {
  // Homeowner messages (avoid: lead, purchased, paid)
  'homeowner.request.received': {
    title: 'Request Received',
    message: 'Your request is received. We\'ll keep you updated.',
  },
  'homeowner.responses.available': {
    title: 'New Responses Available',
    message: 'New installer responses are ready. Compare and choose.',
  },
  'homeowner.selection.confirmed': {
    title: 'Selection Confirmed',
    message: 'Selection confirmed. You can message your installer anytime.',
  },
  'homeowner.appointment.suggested': {
    title: 'Next Steps Suggested',
    message: 'An installer suggested next steps. Review and confirm.',
  },

  // Installer messages
  'installer.new.opportunity': {
    title: 'New Opportunity',
    message: 'A new homeowner request is available in your feed.',
  },
  'installer.bid.won': {
    title: 'You Won!',
    message: 'You won this bid. Please proceed to payment to unlock contact details.',
  },
  'installer.bid.outcome.other': {
    title: 'Bid Outcome',
    message: 'This bid was awarded to another installer. Better luck next time!',
  },
  'installer.data.update': {
    title: 'Request Updated',
    message: 'The request details were updated. Review in your feed.',
  },

  // Admin messages
  'admin.assignment.started': {
    title: 'Assignment Started',
    message: 'Assignment window started for a request. Track responses.',
  },
  'admin.assignment.ended': {
    title: 'Assignment Ended',
    message: 'Assignment window ended. Review responses and decide.',
  },
  'admin.config.updated': {
    title: 'Configuration Updated',
    message: 'Configuration updated successfully.',
  },
};

export function getNotificationText(messageKey: MessageKey): { title: string; message: string } {
  const text = MESSAGE_CATALOG[messageKey];
  if (!text) {
    console.warn(`[Message Catalog] Unknown messageKey: ${messageKey}`);
    return { title: 'Notification', message: 'You have a new notification.' };
  }
  return text;
}
