// Message catalog for notification system
// Centralized, role-aware, user-friendly copy

export type MessageKey =
  // Homeowner messages (service-friendly tone)
  | 'homeowner.request.received'
  | 'homeowner.responses.available'
  | 'homeowner.selection.confirmed'
  | 'homeowner.appointment.suggested'
  | 'homeowner.installer.responded'
  | 'homeowner.installer.confirmed'
  | 'homeowner.bid.received'
  | 'homeowner.lead.rejected'
  | 'homeowner.system.limit_updated'
  | 'homeowner.system.bidding_limit_updated' // Phase 13S.2
  | 'homeowner.lead.purchased'
  | 'homeowner.written_quote.received' // Written Quote
  | 'homeowner.written_quote.counter_offer' // Written Quote
  // Installer messages (professional tone)
  | 'installer.written_quote.counter_received' // Written Quote
  | 'installer.written_quote.accepted' // Written Quote
  | 'installer.written_quote.rejected' // Written Quote
  | 'installer.new.opportunity'
  | 'installer.bid.won'
  | 'installer.bid.outcome.other'
  | 'installer.data.update'
  | 'installer.purchase.confirmed'
  | 'installer.bid.payment.success'
  | 'installer.assignment.removed'
  | 'installer.lead.resold'
  // Admin messages (operational tone)
  | 'admin.assignment.started'
  | 'admin.assignment.ended'
  | 'admin.config.updated'
  | 'admin.lead.purchased'
  | 'admin.bid.submitted'
  | 'admin.bid.winner.selected'
  | 'admin.bid.payment.completed'
  | 'admin.lead.created'
  | 'admin.phone.verified'
  | 'admin.lead.assigned'
  | 'admin.assignment.accepted';

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
  'homeowner.installer.responded': {
    title: 'Installer Responded',
    message: 'An installer has responded to your request and will contact you soon.',
  },
  'homeowner.installer.confirmed': {
    title: 'Installer Confirmed',
    message: 'Your installer confirmed next steps. They\'ll reach out shortly.',
  },
  'homeowner.bid.received': {
    title: 'New Response Received',
    message: 'An installer submitted a response to your request. Review and select.',
  },
  'homeowner.lead.rejected': {
    title: 'Request Update',
    message: 'Your quote request could not be processed at this time. Check details.',
  },
  'homeowner.system.limit_updated': {
    title: 'Quote Limit Updated',
    message: 'Your quote request limit has been updated. Check your dashboard.',
  },
  'homeowner.system.bidding_limit_updated': {
    title: 'Bidding Limit Updated',
    message: 'Your bidding request limit has been updated. Check your dashboard.',
  },
  'homeowner.lead.purchased': {
    title: 'Request Accepted',
    message: 'An installer has accepted your request and will contact you soon.',
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
  'installer.purchase.confirmed': {
    title: 'Purchase Confirmed',
    message: 'Purchase confirmed. You can now contact the homeowner.',
  },
  'installer.bid.payment.success': {
    title: 'Payment Successful',
    message: 'Payment successful. Contact details unlocked.',
  },
  'installer.assignment.removed': {
    title: 'Assignment Removed',
    message: 'Your lead assignment was removed by admin. Check your feed.',
  },
  'installer.lead.resold': {
    title: 'Lead Resold',
    message: 'A purchased lead was resold by admin and removed from your account.',
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
  'admin.lead.purchased': {
    title: 'Lead Purchased',
    message: 'An installer purchased a lead. View transaction details.',
  },
  'admin.bid.submitted': {
    title: 'New Bid Submitted',
    message: 'An installer submitted a new bid. Review in dashboard.',
  },
  'admin.bid.winner.selected': {
    title: 'Bid Winner Selected',
    message: 'Homeowner selected a winning bid. Track payment progress.',
  },
  'admin.bid.payment.completed': {
    title: 'Bid Payment Completed',
    message: 'Winning installer completed payment. Transaction successful.',
  },
  'admin.lead.created': {
    title: 'New Lead Submitted',
    message: 'Homeowner submitted a new lead request. Review and assign to installers.',
  },
  'admin.phone.verified': {
    title: 'Phone Verification Complete',
    message: 'Homeowner completed phone verification. Pending leads now approved.',
  },
  'admin.lead.assigned': {
    title: 'Lead Assigned to Installers',
    message: 'Lead assigned to installers. Monitor bid submissions.',
  },
  'admin.assignment.accepted': {
    title: 'Assignment Accepted',
    message: 'Installer accepted a lead assignment. Track progress in dashboard.',
  },
  // Written Quote messages
  'homeowner.written_quote.received': {
    title: 'New Written Quote Received',
    message: 'An installer has sent you a written quote. Review and respond in your dashboard.',
  },
  'homeowner.written_quote.counter_offer': {
    title: 'Counter-Offer Received',
    message: 'The installer has sent a counter-offer. Review the updated quote.',
  },
  'installer.written_quote.counter_received': {
    title: 'Homeowner Counter-Offer',
    message: 'The homeowner has sent a counter-offer. Review and respond to continue negotiation.',
  },
  'installer.written_quote.accepted': {
    title: 'Written Quote Accepted! 🎉',
    message: 'Great news! The homeowner has accepted your written quote. You can now proceed with the installation.',
  },
  'installer.written_quote.rejected': {
    title: 'Written Quote Declined',
    message: 'The homeowner has declined your written quote. Thank you for your participation.',
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
