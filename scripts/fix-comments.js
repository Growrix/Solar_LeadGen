const fs = require('fs');
let c = fs.readFileSync('src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx', 'utf8');
c = c.replace(/'bids'/g, "'written quotes'")
     .replace(/Fetch bids/g, 'Fetch written quotes')
     .replace(/fetching bids/g, 'fetching written quotes')
     .replace(/load bids/g, 'load written quotes');
fs.writeFileSync('src/components/homeowner/HomeownerWrittenQuoteReviewModal.tsx', c);
console.log('✅ Fixed comments!');
