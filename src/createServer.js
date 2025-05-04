'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { text: getRequestBodyAsText } = require('stream/consumers');

function createServer() {
  return http.createServer(async (request, response) => {
    const { method, url: requestUrl } = request;

    if (requestUrl === '/' && method === 'GET') {
      await serveHtmlPage(response);

      return;
    }

    if (requestUrl === '/add-expense' && method === 'POST') {
      await processExpenseSubmission(request, response);

      return;
    }

    sendErrorResponse(response, 404, 'Invalid URL');
  });
}

async function serveHtmlPage(response) {
  const htmlFilePath = path.join(__dirname, 'public', 'index.html');

  try {
    const htmlContent = await fs.readFile(htmlFilePath, 'utf8');

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(htmlContent);
  } catch (error) {
    sendErrorResponse(response, 500, 'Error loading HTML');
  }
}

async function processExpenseSubmission(request, response) {
  try {
    const requestBody = await getRequestBodyAsText(request);
    const expenseData = JSON.parse(requestBody);

    const { date, title, amount } = expenseData;

    if (!date || !title || !amount) {
      sendErrorResponse(response, 400, 'Missing required fields');

      return;
    }

    const expenseFilePath = path.join(__dirname, '..', 'db', 'expense.json');

    await fs.writeFile(expenseFilePath, JSON.stringify(expenseData), 'utf8');

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(expenseData));
  } catch (error) {
    sendErrorResponse(response, 500, 'Server Error');
  }
}

function sendErrorResponse(response, statusCode, message) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  response.end(message);
}

module.exports = { createServer };
