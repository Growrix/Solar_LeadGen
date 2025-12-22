// Script to rename Bid references to WrittenQuote in copied component
const fs = require('fs');

const filePath = 'src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Component and import replacements
content = content.replace(/HomeownerBiddingReviewModal/g, 'HomeownerWrittenQuoteReviewModal');
content = content.replace(/from '@\/types\/bid'/g, "from '@/types/written-quote'");
content = content.replace(/GetBidsResponse/g, 'GetWrittenQuotesResponse');

// Type alias
content = content.replace(/type BidWithFullData = GetBidsResponse\['bids'\]/g, "type WrittenQuoteWithFullData = GetWrittenQuotesResponse['writtenQuotes']");
content = content.replace(/BidWithFullData/g, 'WrittenQuoteWithFullData');

// Interface prop types
content = content.replace(/bids: BidWithFullData\[\];/g, 'writtenQuotes: WrittenQuoteWithFullData[];');
content = content.replace(/onSelectWinner\?\: \(bidId: string\)/g, 'onSelectWinner?: (writtenQuoteId: string)');

// State variables
content = content.replace(/const \[bids, setBids\]/g, 'const [writtenQuotes, setWrittenQuotes]');
content = content.replace(/const \[selectedBid, setSelectedBid\]/g, 'const [selectedWrittenQuote, setSelectedWrittenQuote]');

// Variable names in code (careful with order)
content = content.replace(/\bsetSelectedBid\b/g, 'setSelectedWrittenQuote');
content = content.replace(/\bselectedBid\b/g, 'selectedWrittenQuote');
content = content.replace(/\bsetBids\b/g, 'setWrittenQuotes');

// API endpoints
content = content.replace(/\/api\/bids/g, '/api/written-quotes');

// UI strings
content = content.replace(/'Review Solar Bids'/g, "'Review Written Quotes'");
content = content.replace(/"Review Solar Bids"/g, '"Review Written Quotes"');

// Data properties - be careful with these
content = content.replace(/data\.bids/g, 'data.writtenQuotes');
content = content.replace(/\['bids'\]/g, "['writtenQuotes']");

// Function parameters - only in arrow functions
content = content.replace(/\.map\(bid =>/g, '.map(writtenQuote =>');
content = content.replace(/\.filter\(bid =>/g, '.filter(writtenQuote =>');
content = content.replace(/\.find\(bid =>/g, '.find(writtenQuote =>');
content = content.replace(/\.some\(bid =>/g, '.some(writtenQuote =>');
content = content.replace(/\.every\(bid =>/g, '.every(writtenQuote =>');

// Function parameters - named functions
content = content.replace(/\(bid: WrittenQuoteWithFullData\)/g, '(writtenQuote: WrittenQuoteWithFullData)');

// Inside spread/destructure and access
content = content.replace(/\.\.\write.bid\./g, '...writtenQuote.');
content = content.replace(/\bbid\./g, 'writtenQuote.');
content = content.replace(/\bbid\)/g, 'writtenQuote)');
content = content.replace(/\bbid,/g, 'writtenQuote,');
content = content.replace(/\bbid:/g, 'writtenQuote:');

// Fix variable names
content = content.replace(/sortedwrittenQuotes/g, 'sortedWrittenQuotes');
content = content.replace(/transformedwrittenQuotes/g, 'transformedWrittenQuotes');
content = content.replace(/getBestwrittenQuote/g, 'getBestWrittenQuote');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File transformed successfully!');
