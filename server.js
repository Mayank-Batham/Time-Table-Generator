const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// Enable CORS for your frontendSSSSS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Parse JSON bodies
app.use(express.json());

// Test the n8n webhook URL
app.get('/api/test-webhook', async (req, res) => {
  try {
    console.log('Testing n8n webhook URL...');
    const n8nResponse = await fetch('https://jellomello.app.n8n.cloud/webhook/8f1e1932-7c63-4c1b-8936-d3aa13c5395d', {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    });

    console.log('n8n Test Response status:', n8nResponse.status);
    console.log('n8n Test Response headers:', Object.fromEntries(n8nResponse.headers.entries()));

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n Test Error response:', errorText);
      throw new Error(`n8n responded with status: ${n8nResponse.status}, body: ${errorText}`);
    }

    const data = await n8nResponse.text();
    console.log('n8n Test Response data:', data);
    
    res.json({ 
      status: 'success',
      message: 'Webhook URL is accessible',
      response: data
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to access webhook URL',
      error: error.message
    });
  }
});

// Proxy endpoint
app.post('/api/timetable', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const n8nResponse = await fetch('https://jellomello.app.n8n.cloud/webhook/8f1e1932-7c63-4c1b-8936-d3aa13c5395d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      body: JSON.stringify(req.body)
    });

    console.log('n8n Response status:', n8nResponse.status);
    console.log('n8n Response headers:', Object.fromEntries(n8nResponse.headers.entries()));

    // Try to get the response as text first
    const responseText = await n8nResponse.text();
    console.log('Raw n8n response:', responseText);

    // If the response is not OK, throw an error with the response text
    if (!n8nResponse.ok) {
      throw new Error(`n8n responded with status: ${n8nResponse.status}, body: ${responseText}`);
    }

    // Check if the response is empty
    if (!responseText) {
      throw new Error('Empty response received from n8n');
    }

    // Try to parse as JSON first (in case n8n returns JSON)
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Parsed JSON response:', jsonData);
      
      // If it's JSON, check if it has a CSV field
      if (jsonData.csv) {
        res.send(jsonData.csv);
      } else {
        res.send(responseText);
      }
    } catch (e) {
      // If not JSON, send the raw text
      console.log('Response is not JSON, sending as text');
      res.send(responseText);
    }
  } catch (error) {
    console.error('Proxy error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Proxy server is working!' });
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 