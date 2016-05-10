'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

const tokenUrl = 'protocol/openid-connect/token';

function getToken(baseUrl, settings) {
  return new Promise((resolve, reject) => {
    settings = settings || {};

    settings.realmName = settings.realmName ? settings.realmName : 'master';

    const options = url.parse(`${baseUrl}/realms/${settings.realmName}/${tokenUrl}`);

    options.headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };

    options.method = 'POST';

    options.data = settings;

    const caller = (options.protocol === 'https:') ? https : http;
    const data = [];
    const req = caller.request(options, (res) => {
      res.on('data', (chunk) => {
        data.push(chunk);
      }).on('end', () => {
        try {
          const parsedData = JSON.parse(Buffer.concat(data).toString());
          if (res.statusCode !== 200) {
            return reject(parsedData);
          }

          const token = parsedData.access_token;
          resolve(token);
        } catch(e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(querystring.stringify(options.data));
    req.end();
  });
}

module.exports = getToken;
