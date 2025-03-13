'use strict';

const http = require('http');
const fs = require('fs').promises;

function createServer() {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    if (parsedUrl.pathname !== '/add-expense') {
      res.statusCode = 404;

      return res.end('Bad request');
    }

    let requestBody = '';

    for await (const chunk of req) {
      requestBody += chunk;
    }

    let expenseData;

    try {
      expenseData = JSON.parse(requestBody);
    } catch (error) {
      res.statusCode = 400;

      return res.end(`${error.message} error`);
    }

    const { date, title, amount } = expenseData;

    if (!date || !title || !amount) {
      res.statusCode = 404;

      return res.end('No data received');
    }

    try {
      await fs.writeFile('./db/expense.json', requestBody);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(requestBody);
    } catch (error) {
      res.statusCode = 500;
      res.end('error saving data');
    }
  });

  return server;
}

module.exports = {
  createServer,
};
