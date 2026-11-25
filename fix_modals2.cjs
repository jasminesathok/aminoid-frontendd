const fs = require('fs');

const files = [
  'src/pages/sales/Proposals.jsx',
  'src/pages/sales/SalesAccounts.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Outer wrapper
    content = content.replace(
      /className="fixed inset-0 bg-[^"]+ backdrop-blur-sm z-50 flex items-center justify-center [^"]+ overflow-y-auto"/g,
      (match) => match.replace('items-center', 'items-start').replace('overflow-y-auto', 'py-12 overflow-y-auto')
    );

    // Inner wrapper
    content = content.replace(/ flex flex-col max-h-\[[a-z0-9]+\]/g, '');
    content = content.replace(/ my-auto /g, ' m-auto ');

    // Header
    content = content.replace(/sticky top-0 z-20/g, 'rounded-t-2xl');
    content = content.replace(/sticky top-0 z-10/g, 'rounded-t-2xl');
    content = content.replace(/sticky top-0/g, ''); // For safety

    // Footer
    content = content.replace(/sticky bottom-0 z-20/g, 'rounded-b-2xl');
    content = content.replace(/sticky bottom-0 z-10/g, 'rounded-b-2xl');
    content = content.replace(/sticky bottom-0/g, '');

    // Body
    content = content.replace(/flex-1 overflow-y-auto /g, '');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed ' + file);
    } else {
      console.log('No matching patterns to fix for ' + file);
    }
  } else {
    console.log('File not found: ' + file);
  }
});
