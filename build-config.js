const fs = require('fs');

const key = process.env.GROQ_API_KEY || '';
const masked = key ? key.slice(0, 8) + '...' + key.slice(-4) : '(empty)';
console.log(` GROQ_API_KEY: ${masked}`);

const config = `// Auto-generated at build time — DO NOT edit manually
const CONFIG = {
    GROQ_API_KEY: '${key}'
};
`;
fs.writeFileSync('config.js', config);
console.log('✅ config.js generated');
