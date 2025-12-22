const fs = require('fs');
let content = fs.readFileSync('src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx', 'utf8');

content = content
  .replace(/bids: initialBids/g, 'writtenQuotes: initialWrittenQuotes')
  .replace(/\binitialBids\b/g, 'initialWrittenQuotes')
  .replace(/useState<WrittenQuoteWithFullData\[\]>\(initialBids\)/g, 'useState<WrittenQuoteWithFullData[]>(initialWrittenQuotes)')
  .replace(/\bisLoadingBids\b/g, 'isLoadingWrittenQuotes')
  .replace(/\bsetIsLoadingBids\b/g, 'setIsLoadingWrittenQuotes')
  .replace(/\bbidsError\b/g, 'writtenQuotesError')
  .replace(/\bsetBidsError\b/g, 'setWrittenQuotesError')
  .replace(/\bfetchBids\b/g, 'fetchWrittenQuotes')
  .replace(/\bbids\.length\b/g, 'writtenQuotes.length')
  .replace(/\bbids\[/g, 'writtenQuotes[')
  .replace(/\(bids,/g, '(writtenQuotes,')
  .replace(/Fetching bids/g, 'Fetching written quotes')
  .replace(/fetch bids/g, 'fetch written quotes')
  .replace(/Bids fetched/g, 'Written quotes fetched')
  .replace(/first bid/g, 'first written quote');

fs.writeFileSync('src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx', content);
console.log('✅ Fixed remaining variable references!');
