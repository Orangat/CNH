const serverless = require('serverless-http');
const express = require('express');
const provider = require('netlify-cms-github-oauth-provider');

const app = express();

// Netlify Functions mount this handler at "/.netlify/functions/auth".
// Depending on the adapter, the internal path may be "/" or "/auth".
app.get('/', provider.auth);
app.get('/auth', provider.auth);

module.exports.handler = serverless(app);

