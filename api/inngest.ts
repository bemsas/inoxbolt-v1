import { serve } from 'inngest/vercel';
import { inngest } from '../lib/inngest/client';
import { functions } from '../lib/inngest/functions';

const handler = serve({
  client: inngest,
  functions,
});

export default handler;
