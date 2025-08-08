import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  // Forward all query params and method
  const { method, query, body, headers } = req;
  const url = `${BACKEND_URL}/disasters${req.url?.replace(/^\/api\/disasters/, '') || ''}`;

  // Forward cookies and Authorization header if present
  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (headers.authorization) fetchHeaders['Authorization'] = headers.authorization as string;
  if (headers.cookie) fetchHeaders['Cookie'] = headers.cookie as string;

  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
    credentials: 'include',
  };
  if (method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const backendRes = await fetch(url, fetchOptions);
    const contentType = backendRes.headers.get('content-type');
    res.status(backendRes.status);
    if (contentType && contentType.includes('application/json')) {
      const data = await backendRes.json();
      res.json(data);
    } else {
      const text = await backendRes.text();
      res.send(text);
    }
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: (err as Error).message });
  }
}
