process.env.NETLIFY_SERVERLESS = 'true';
const serverless = require('serverless-http');
const app = require('../../server/app');

// Serverless function handler for Netlify
module.exports.handler = serverless(app);
