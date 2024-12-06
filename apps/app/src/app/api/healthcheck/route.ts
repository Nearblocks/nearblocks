// pages/api/healthcheck.js

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}