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
  | 'homeowner.written_quote.submitted'
  | 'homeowner.written_quote.revised'
  | 'homeowner.written_quote.done_deal_requested'
  | 'homeowner.written_quote.done_deal_accepted'
  | 'homeowner.written_quote.done_deal_rejected'
  | 'homeowner.written_quote.purchased'
  | 'homeowner.written_quote.negotiation_expired'
  | 'homeowner.written_quote.rejected'
  // Installer messages (professional tone)
  | 'installer.new.opportunity'
  | 'installer.bid.won'
  | 'installer.bid.received'
  | 'installer.bid.outcome.other'
  | 'installer.data.update'
  | 'installer.purchase.confirmed'
  | 'installer.bid.payment.success'
  | 'installer.assignment.removed'
  | 'installer.lead.resold'
  | 'installer.written_quote.submitted'
  | 'installer.written_quote.counter_received'
  | 'installer.written_quote.done_deal_requested'
  | 'installer.written_quote.done_deal_accepted'
  | 'installer.written_quote.done_deal_rejected'
  | 'installer.written_quote.purchased'
  | 'installer.written_quote.negotiation_expired'
  | 'installer.written_quote.rejected'
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
  | 'admin.assignment.accepted'
  | 'admin.written_quote.submitted'
  | 'admin.written_quote.rejected'
  | 'admin.written_quote.done_deal_requested'
  | 'admin.written_quote.done_deal_accepted'
  | 'admin.written_quote.done_deal_rejected'
  | 'admin.written_quote.purchased'
  | 'admin.written_quote.extension_requested';

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
  'homeowner.written_quote.submitted': {
    title: 'New Written Quote',
    message: 'An installer submitted a written quote for your request. Review and respond in your dashboard.',
  },
  'homeowner.written_quote.revised': {
    title: 'Quote Updated',
    message: 'The installer updated the written quote. Review the latest offer in your dashboard.',
  },
  'homeowner.written_quote.done_deal_requested': {
    title: 'Action Needed',
    message: 'The installer requested to finalize the deal on the latest offer. Review and accept or reject.',
  },
  'homeowner.written_quote.done_deal_accepted': {
    title: 'Deal Accepted',
    message: 'The deal has been accepted. The installer can now proceed to purchase and unlock contact details.',
  },
  'homeowner.written_quote.done_deal_rejected': {
    title: 'Deal Update',
    message: 'The done-deal request was declined. Negotiation is open again in your dashboard.',
  },
  'homeowner.written_quote.purchased': {
    title: 'Purchase Completed',
    message: 'The installer completed the purchase and can now contact you. Check your dashboard for details.',
  },
  'homeowner.written_quote.negotiation_expired': {
    title: 'Negotiation Expired',
    message: 'The negotiation window has expired. Please contact support if you need more time.',
  },
  'homeowner.written_quote.rejected': {
    title: 'Quote Update',
    message: 'The installer has rejected the negotiation. You can review other options in your dashboard.',
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
  'installer.bid.received': {
    title: 'New Activity',
    message: 'There is new activity on your quote. Check your dashboard for details.',
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
  'installer.written_quote.submitted': {
    title: 'Written Quote Submitted',
    message: 'Your written quote has been submitted successfully. You will be notified of any updates.',
  },
  'installer.written_quote.counter_received': {
    title: 'Counter Offer Received',
    message: 'The homeowner sent a counter offer on your written quote. Review and respond in your leads.',
  },
  'installer.written_quote.done_deal_requested': {
    title: 'Action Needed',
    message: 'The homeowner requested to finalize the deal on the latest offer. Review and accept or reject.',
  },
  'installer.written_quote.done_deal_accepted': {
    title: 'Deal Accepted',
    message: 'The deal has been accepted. You can now proceed to purchase and unlock contact details.',
  },
  'installer.written_quote.done_deal_rejected': {
    title: 'Deal Update',
    message: 'The done-deal request was declined. Negotiation is open again in your leads.',
  },
  'installer.written_quote.purchased': {
    title: 'Purchase Confirmed',
    message: 'Purchase confirmed. Contact details are unlocked for this written quote.',
  },
  'installer.written_quote.negotiation_expired': {
    title: 'Negotiation Expired',
    message: 'The negotiation window has expired for this written quote. Please contact support if you need more time.',
  },
  'installer.written_quote.rejected': {
    title: 'Quote Update',
    message: 'The homeowner has rejected the negotiation for this written quote.',
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
  'admin.written_quote.submitted': {
    title: 'New Written Quote Submitted',
    message: 'An installer submitted a written quote. Review the lead and negotiation details.',
  },
  'admin.written_quote.rejected': {
    title: 'Written Quote Rejected',
    message: 'A written quote negotiation was rejected. Review the lead timeline for details.',
  },
  'admin.written_quote.done_deal_requested': {
    title: 'Done-Deal Requested',
    message: 'A user requested to finalize a written quote deal. Track acceptance status in the lead view.',
  },
  'admin.written_quote.done_deal_accepted': {
    title: 'Deal Accepted',
    message: 'A written quote deal was accepted. Await purchase completion to unlock contact details.',
  },
  'admin.written_quote.done_deal_rejected': {
    title: 'Done-Deal Declined',
    message: 'A done-deal request was declined and negotiation reopened. Review the lead timeline.',
  },
  'admin.written_quote.purchased': {
    title: 'Written Quote Purchased',
    message: 'A written quote purchase was completed. Review transaction and lead details.',
  },
  'admin.written_quote.extension_requested': {
    title: 'Extension Requested',
    message: 'A user requested an admin extension for a written quote negotiation window.',
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
