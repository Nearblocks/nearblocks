const fs = require('fs');

// Filter environment variables that start with NEXT_
const envVariables = Object.keys(process.env)
  .filter((key) => key.startsWith('NEXT_'))
  .reduce((obj, key) => {
    obj[key] = process.env[key];
    return obj;
  }, {});

// Prepare content for __ENV.js
const content = `window.__ENV = ${JSON.stringify(envVariables)};`;

// Write the __ENV.js file inside public folder
fs.writeFile('apps/app-lite/public/__ENV.js', content, (err) => {
  if (err) throw err;
  console.log('__ENV.js has been saved with the latest environment variables.');
});
