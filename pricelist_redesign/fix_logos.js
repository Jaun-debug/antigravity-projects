const fs = require('fs');

let data = fs.readFileSync('data.js', 'utf8');

const mapping = {
  'kalahari-red-dunes': 'https://i.ibb.co/1Jb2wp7Z/Screenshot-2026-04-02-at-20-45-35.png',
  'trans-kalahari': 'https://i.ibb.co/WNbRRXjS/Screenshot-2026-04-02-at-20-48-17.png',
  'teufelskrallen': 'https://i.ibb.co/rKMHzy6y/Screenshot-2026-04-02-at-20-46-31.png',
  'namib-outpost': 'https://i.ibb.co/BVz1XKS8/Screenshot-2026-04-02-at-20-50-25.png',
  'desert-homestead': 'https://i.ibb.co/bjTQ7xpD/Screenshot-2026-04-02-at-20-47-10.png',
  'brigadoon': 'https://i.ibb.co/gFcXSdP6/Screenshot-2026-04-02-at-20-54-18.png',
  'twyfelfontein': 'https://i.ibb.co/hJ2VFBmG/Screenshot-2026-04-02-at-20-53-40.png',
  'etosha-oberland': 'https://i.ibb.co/N2RrydLF/Screenshot-2026-04-02-at-20-51-35.png'
};

// Clear all logos first
data = data.replace(/\n\s+logo: "[^"]+",/g, '');

// Insert correct logos
for (const [id, url] of Object.entries(mapping)) {
  const re = new RegExp(`(id:\\s*"${id}",\\s*\\n\\s*name:\\s*"[^"]+",\\s*\\n\\s*image:\\s*"[^"]+",)`);
  data = data.replace(re, `$1\n      logo: "${url}",`);
}

fs.writeFileSync('data.js', data);
console.log('Fixed logos');
