const API_URL = process.env.BREVO_URL;
const API_KEY = process.env.BREVO_API_KEY;
const TO_EMAIL = process.env.BREVO_TO_EMAIL;

export default async function handler(req: any, res: any) {
  const { method } = req;
  if (method === 'POST') {
    try {
      const { body } = req;

      console.log(body);
      const { name, email, subject, description } = body;

      if (!API_URL) {
        return res.status(500).json({ status: 0, err: 'API URL not defined' });
      }

      const requestOptions = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Api-Key': API_KEY || '',
        },
        body: JSON.stringify({
          sender: { name, email },
          to: [{ email: TO_EMAIL || '' }],
          subject,
          htmlContent: description,
        }),
      };

      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();

      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ status: 0, err: err.message });
    }
  }
}
