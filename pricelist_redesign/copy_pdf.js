const fs = require('fs');
try {
  const data = fs.readFileSync('/Users/jaunhusselmann/Desktop/Copy of Copy of sto 20 rates 2027_lowres.pdf');
  fs.writeFileSync('/Users/jaunhusselmann/.gemini/antigravity/scratch/pricelist_redesign/pricelist.pdf', data);
  console.log('Successfully copied the file via Node!');
} catch (e) {
  console.error('Failed:', e.message);
}
