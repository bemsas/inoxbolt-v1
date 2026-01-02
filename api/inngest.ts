import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serve } from 'inngest/next';
import { inngest } from '../lib/inngest/client';
import { functions } from '../lib/inngest/functions';

const inngestHandler = serve({
  client: inngest,
  functions,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Convert Vercel request/response to Web API format for Inngest
  const request = new Request(`https://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  const response = await inngestHandler.GET(request);

  if (req.method === 'POST') {
    const postResponse = await inngestHandler.POST(request);
    res.status(postResponse.status);
    postResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await postResponse.text();
    return res.send(body);
  }

  if (req.method === 'PUT') {
    const putResponse = await inngestHandler.PUT(request);
    res.status(putResponse.status);
    putResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await putResponse.text();
    return res.send(body);
  }

  // Default to GET
  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const body = await response.text();
  return res.send(body);
}
