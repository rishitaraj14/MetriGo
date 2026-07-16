export default function handler(req: any, res: any) {
  const q = (req.query && req.query.q) || (req.body && req.body.q) || 'Unknown';
  res.json({
    query: q,
    lat: 12.9715987,
    lon: 77.5945627,
    display_name: `Mock geocode result for ${q}`,
  });
}
