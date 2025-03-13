'use strict';

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

function createServer() {
  const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (url === '/' && method === 'GET') {
      serveHTML(res);
    } else if (url === '/add-expense' && method === 'POST') {
      handleExpenseSubmission(req, res);
    } else {
      respondWithError(res, 404, 'Invalid URL');
    }
  });

  server.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Server error:', error);
  });

  return server;
}

function serveHTML(res) {
  const htmlContent = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Form Data</title>
      </head>
      <body>
        <h1>Form Data</h1>
        <form action="/add-expense" method="post">
          <label>Date</label>
          <input type="date" name="date" required />
          <br />
          <label>Title</label>
          <input type="text" name="title" required />
          <br />
          <label>Amount</label>
          <input type="number" name="amount" required />
          <br />
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(htmlContent);
}

function handleExpenseSubmission(req, res) {
  let body = '';

  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const expense = parseExpenseData(body);

    if (!expense.date || !expense.title || !expense.amount) {
      return respondWithError(res, 400, 'Missing required fields');
    }

    fs.writeFile(
      './db/expense.json',
      JSON.stringify(expense, null, 2),
      (err) => {
        if (err) {
          return respondWithError(res, 500, 'Server Error');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expense, null, 2));
      },
    );
  });
}

function parseExpenseData(body) {
  const formData = querystring.parse(body);

  try {
    return JSON.parse(body);
  } catch {
    return {
      date: formData.date,
      title: formData.title,
      amount: formData.amount,
    };
  }
}

function respondWithError(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  res.end(message);
}

module.exports = { createServer };
