export default function handler(req: any, res: any) {
  const { message } = req.query || req.body || {};
  res.json({
    reply: `This is a mock assistant reply to: ${message || 'hello'}`,
  });
}
