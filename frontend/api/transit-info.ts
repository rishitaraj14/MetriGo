export default function handler(req: any, res: any) {
  const { start, end } = req.query || req.body || {};
  res.json({
    fares: {
      bus: 20,
      metro: 30,
      taxi: 180,
    },
    recommended: 'bus',
    notes: `Mock transit fares between ${start || 'A'} and ${end || 'B'}`,
  });
}
