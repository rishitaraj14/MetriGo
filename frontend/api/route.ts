export default function handler(req: any, res: any) {
  const { start, end } = req.query || req.body || {};
  res.json({
    start: start || 'Point A',
    end: end || 'Point B',
    distance_km: 5.2,
    duration_min: 18,
    path: [
      { lat: 12.9716, lon: 77.5946 },
      { lat: 12.975, lon: 77.6 },
    ],
  });
}
