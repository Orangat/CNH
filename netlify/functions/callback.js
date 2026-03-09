const serverless = require('serverless-http');
const express = require('express');
const provider = require('netlify-cms-github-oauth-provider');

const app = express();

// Netlify Functions mount this handler at "/.netlify/functions/callback".
// Depending on the adapter, the internal path may be "/" or "/callback".
app.get('/', provider.callback);
app.get('/callback', provider.callback);

module.exports.handler = serverless(app);

