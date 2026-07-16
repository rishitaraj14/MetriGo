export default function handler(req: any, res: any) {
  // Serverless functions are stateless; return a placeholder.
  res.status(501).json({
    error: 'History storage not available in this mock. Deploy full backend for persistence.',
  });
}
