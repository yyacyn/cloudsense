const fs = require('fs');
const config = `// Auto-generated at build time — DO NOT edit manually
const CONFIG = {
    GROQ_API_KEY: '${process.env.GROQ_API_KEY || ''}'
};
`;
fs.writeFileSync('config.js', config);
console.log('✅ config.js generated');
