import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const historyFilePath = path.resolve(__dirname, 'journey-history.json');

async function loadHistory() {
  try {
    const raw = await fs.readFile(historyFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveHistory(history: any[]) {
  await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), 'utf-8');
}

app.use(cors());
app.use(express.json());

// Initialize Gemini API if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI Client initialized successfully.');
  } catch (error: any) {
    console.error('Error initializing Gemini client:', error.message);
  }
} else {
  console.log('No GEMINI_API_KEY found. Running in Mock Fallback Mode.');
}

// 1. Geocode endpoint (OSM Nominatim Proxy)
app.get('/api/geocode', async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    console.log(`Geocoding query: ${q}`);
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        limit: 5,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'MetriGo-Transit-App/1.0'
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

// 2. Routing endpoint (OSRM Proxy)
app.get('/api/route', async (req: Request, res: Response) => {
  const { start, end } = req.query; // format: "lon,lat"
  if (!start || !end) return res.status(400).json({ error: 'Start and End coordinates required (lon,lat)' });

  try {
    console.log(`Fetching route from ${start} to ${end}`);
    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}`;
    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: true
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error('Routing error:', error.message);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
});

// Helper: Calculate localized transport fares based on city context
interface Fares {
  distance: string;
  duration: number;
  cab: { hatchback: number; sedan: number; suv: number };
  auto: { official: number; streetMin: number; streetMax: number };
  public: { metro: number; bus: number };
}

function calculateFares(distanceKm: number, durationMin: number, city = 'Chennai'): Fares {
  const distance = parseFloat(distanceKm.toString());
  const duration = parseFloat(durationMin.toString());
  const cleanCity = (city || 'Chennai').toLowerCase().trim();

  // 1. Cab Fares (Hatchback/Sedan/SUV)
  const cabBase = 50;
  const cabHatch = Math.round(cabBase + (distance * 14) + (duration * 1.5));
  const cabSedan = Math.round(cabBase * 1.2 + (distance * 18) + (duration * 2));
  const cabSUV = Math.round(cabBase * 1.6 + (distance * 24) + (duration * 2.5));

  // 2. Auto Fares (Official Government Rates vs Realistic Street Negotiated rates)
  let autoOfficial = 0;
  let autoStreetMin = 0;
  let autoStreetMax = 0;

  if (cleanCity.includes('mumbai')) {
    autoOfficial = distance <= 1.5 ? 23 : Math.round(23 + (distance - 1.5) * 15.33);
    autoStreetMin = Math.round(40 + (distance * 16));
    autoStreetMax = Math.round(70 + (distance * 22));
  } else if (cleanCity.includes('delhi')) {
    autoOfficial = distance <= 1.5 ? 30 : Math.round(30 + (distance - 1.5) * 11);
    autoStreetMin = Math.round(50 + (distance * 13));
    autoStreetMax = Math.round(80 + (distance * 18));
  } else if (cleanCity.includes('bangalore') || cleanCity.includes('bengaluru')) {
    autoOfficial = distance <= 1.9 ? 30 : Math.round(30 + (distance - 1.9) * 15);
    autoStreetMin = Math.round(60 + (distance * 18));
    autoStreetMax = Math.round(90 + (distance * 24));
  } else if (cleanCity.includes('chennai')) {
    autoOfficial = distance <= 1.8 ? 30 : Math.round(30 + (distance - 1.8) * 15);
    autoStreetMin = Math.round(75 + (distance * 20));
    autoStreetMax = Math.round(110 + (distance * 26));
  } else {
    autoOfficial = distance <= 1.5 ? 25 : Math.round(25 + (distance - 1.5) * 12);
    autoStreetMin = Math.round(50 + (distance * 15));
    autoStreetMax = Math.round(80 + (distance * 20));
  }

  // 3. Public Transit Estimates (Metro and Bus)
  const metroFare = distance <= 2 ? 10 : distance <= 5 ? 20 : distance <= 12 ? 30 : distance <= 21 ? 40 : 50;
  const busFare = distance <= 3 ? 5 : distance <= 10 ? 12 : distance <= 18 ? 18 : 25;

  return {
    distance: distance.toFixed(2),
    duration: Math.round(duration),
    cab: { hatchback: cabHatch, sedan: cabSedan, suv: cabSUV },
    auto: { official: autoOfficial, streetMin: autoStreetMin, streetMax: autoStreetMax },
    public: { metro: metroFare, bus: busFare }
  };
}

function generateMockInsights(city: string, startName: string, endName: string, fares: Fares): { localTransitGuide: string, roadAdvisory: string, timeSensitiveTips: string } {
  const cleanCity = (city || 'India').toLowerCase().trim();
  const cCity = city.charAt(0).toUpperCase() + city.slice(1);

  if (cleanCity.includes('patna')) {
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName}
* **Patna Metro (Under Construction):** Metro lines are currently being built. Avoid expecting Metro rail travel for this route.
* **BSRTC City Buses:** Take BSRTC city buses running along Bailey Road and Ashok Rajpath. Fares range between ₹15-₹25.
* **Shared Autos (Tempo):** Extremely popular option. Wave down shared autos going towards your destination for ₹10-₹20.
* **Auto Bargaining Advice:** Direct auto-rickshaws do not run by meter. They will demand ₹150-₹200 initially. A fair bargain rate is around ₹${fares.auto.streetMin}-₹${fares.auto.streetMax}.`,
      roadAdvisory: `* **Traffic Bottlenecks:** Avoid Dak Bungalow Crossing, Gandhi Maidan roads, and Patna Junction approach during morning and evening rush hours.
* **Road Conditions:** Bailey Road is wide and in excellent condition. Ashok Rajpath is narrower with high pedestrian density.`,
      timeSensitiveTips: `* **Peak Hours:** Travel between 12:00 PM and 4:00 PM to save 10-15 minutes of commuting time.
* **Weather Alert:** Heavy monsoon rainfall causes immediate waterlogging near low-lying areas of Patna Junction and Rajendra Nagar.`
    };
  } else if (cleanCity.includes('saharsa')) {
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName}
* **E-Rickshaws (Toto):** The most common transport in Saharsa. Shared Totos charge only ₹10-₹15 per seat for routes along DB Road and Station Road.
* **Cycle Rickshaws:** Best option for extremely narrow lanes and local markets. Fares range between ₹20-₹40.
* **Private Autos:** No digital meters are used. Drivers will ask for a flat fare of ₹100-₹120. A realistic fare is around ₹${fares.auto.streetMin}-₹${fares.auto.streetMax}.
* **Public Buses:** No local city bus network is active. Rely entirely on E-rickshaws or walking for short commutes.`,
      roadAdvisory: `* **Traffic Alert:** Expect slow traffic near DB Road, the Railway Station circle, and Dharamshala Chowk due to pedestrian crowds.
* **Road Quality:** Roads are mostly narrow and uneven. Watch out for sudden path breaks and potholes.`,
      timeSensitiveTips: `* **Best Time to Travel:** Early mornings (before 9:00 AM) or early afternoons (2:00 PM - 4:00 PM) are much quieter.
* **Monsoon Advice:** Street flooding is common during heavy rains. Walking or cycle rickshaws are highly recommended over Totos in flooded lanes.`
    };
  } else if (cleanCity.includes('ranchi')) {
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName}
* **RMC City Buses:** Ranchi Municipal Corporation runs city buses connecting major points like Kutchery, Albert Ekka Chowk, and Hatia. Fares are around ₹15-₹30.
* **Shared Autos:** Very active along Main Road and Circular Road. Fares are ₹10-₹25 depending on distance.
* **Auto Negotiation:** Auto-rickshaws do not run on meters. Expect initial quotes of ₹150. Bargain down to ₹${fares.auto.streetMin}-₹${fares.auto.streetMax} for a direct ride.
* **E-Rickshaws:** Widely available at major crossings for short-distance connections (₹10 flat).`,
      roadAdvisory: `* **Traffic Alert:** Avoid Kantatoli Chowk, Lalpur Crossing, and Sujata Chowk during peak hours (9:00 AM - 11:00 AM & 6:00 PM - 8:30 PM). Flyover construction can cause delays.
* **Road Conditions:** Main transit corridors are well-paved, but side streets can be bumpy.`,
      timeSensitiveTips: `* **Travel Window:** Traveling between 1:00 PM and 3:30 PM avoids school and corporate rush hours.
* **Night Surcharge:** Auto fares inflate by 30-50% after 9:30 PM as public transit options shut down.`
    };
  } else if (cleanCity.includes('mumbai')) {
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName}
* **Mumbai Metro:** Fast transit connection. Check lines connecting suburbs. Metro fare is estimated at ₹${fares.public.metro}.
* **Suburban Local Trains:** The lifeline of Mumbai. Connect via Western or Central line depending on start/end station.
* **BEST Buses:** Extensive network connecting local areas. Economical option (₹5-₹20).
* **Auto Rickshaw Meter:** Suburb auto drivers run strictly on government-regulated digital meters (official start fare is ₹23). No bargaining needed!`,
      roadAdvisory: `* **Traffic Alert:** Avoid SCLR, Western Express Highway, and JVLR during peak hours. Traffic crawls at bottlenecks.
* **Road Conditions:** Main highways are well-paved; minor suburban links may have monsoon potholes.`,
      timeSensitiveTips: `* **Peak Commute:** Avoid local train travel towards South Mumbai in the morning (8:00 AM - 10:30 AM) and towards suburbs in the evening unless traveling in first class.
* **Taxis:** Kaali-Peeli taxis are available throughout the city and run on meters.`
    };
  } else if (cleanCity.includes('delhi')) {
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName}
* **Delhi Metro:** The cleanest and fastest option. Buy tickets or use Metro Card. Fare is around ₹${fares.public.metro}.
* **DTC Buses:** Red (AC) and Green (non-AC) buses cover the entire city. Safe and very affordable (₹10-₹25).
* **Auto Rickshaws:** Drivers rarely agree to run on meter. Expect flat fares around ₹${fares.auto.streetMin}-₹${fares.auto.streetMax}.
* **E-Rickshaws:** Available at almost all Metro station exits for last-mile connectivity (₹10 shared).`,
      roadAdvisory: `* **Traffic Bottlenecks:** Ring Road, Outer Ring Road, and areas near Delhi border crossings face major rush hour delays.
* **Road Quality:** Excellent multi-lane roads, though lane discipline is frequently ignored.`,
      timeSensitiveTips: `* **Best Time to Travel:** Mid-day (12:00 PM - 4:00 PM) offers congestion-free driving.
* **Pollution Watch:** Winter mornings can have heavy smog, reducing visibility on highways.`
    };
  } else if (cleanCity.includes('bangalore') || cleanCity.includes('bengaluru')) {
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName}
* **Namma Metro:** Purple and Green lines run across major tech and residential sectors. AC coaches. Fare is ₹${fares.public.metro}.
* **BMTC Buses:** Excellent Volvo AC (Vajra) and non-AC buses. Extremely reliable. Fares range between ₹15-₹45.
* **Auto Negotiation:** Auto drivers rarely agree to the government meter of ₹30. Expect demands of 'one-and-half' or flat ₹100+. Negotiate around ₹${fares.auto.streetMin}-₹${fares.auto.streetMax}.
* **Ride-Hailing autos:** Using Uber/Ola Auto is highly recommended to get fixed prices.`,
      roadAdvisory: `* **Traffic Alert:** Heavy congestion near Silk Board, Outer Ring Road (ORR), Tin Factory, and Hebbal. 
* **Road Quality:** Road construction and metro work cause diversions and bumpy conditions.`,
      timeSensitiveTips: `* **Travel Window:** Avoid commuting between 8:30 AM - 10:30 AM and 6:00 PM - 8:30 PM to save up to 30 minutes of travel time.
* **Rain Warning:** A short shower can lock down major Bangalore junctions for hours due to waterlogging.`
    };
  } else {
    // Default fallback for any other Indian city
    return {
      localTransitGuide: `### Local Transit Guide: ${startName} to ${endName} in ${cCity}
* **City Buses:** Local transit buses run regularly along major city centers. Economical option (₹10-₹20).
* **E-Rickshaws / Shared Autos:** Shared E-rickshaws or local autos connect the main residential areas and markets for ₹10-₹15.
* **Auto Rickshaw Bargaining:** Autos do not use meters. They will quote higher rates for outsiders. A reasonable negotiated fare is ₹${fares.auto.streetMin}-₹${fares.auto.streetMax}.`,
      roadAdvisory: `* **Traffic Alert:** Main market streets and intersections near the central bus stand or railway station are busiest.
* **Road Conditions:** Broad primary roads connecting the city center, but residential roads may be narrow.`,
      timeSensitiveTips: `* **Best Travel Time:** Mid-afternoon (1:00 PM - 4:00 PM) avoids the market crowd and traffic.
* **Peak Fares:** Night auto rates (after 10 PM) are typically 1.5 times standard flat rates.`
    };
  }
}

// 3. AI Transit Insights & Fare calculation
app.post('/api/transit-info', async (req: Request, res: Response) => {
  const { city, startName, endName, distance, duration } = req.body;
  if (!startName || !endName || !distance || !duration) {
    return res.status(400).json({ error: 'Missing transit routing properties' });
  }

  const fares = calculateFares(distance / 1000, duration / 60, city);

  // Dynamic Fallback response generator based on city context
  let aiInsights = generateMockInsights(city, startName, endName, fares);

  if (aiClient) {
    try {
      console.log('Generating AI transit insights using Gemini...');
      const prompt = `You are "MetriGo AI", a street-smart local transit expert in India.
The user wants to travel from "${startName}" to "${endName}".
The distance is ${(distance / 1000).toFixed(2)} km and the driving time is ${Math.round(duration / 60)} minutes.
Based on this path (and identifying the city context, e.g. Chennai, Bangalore, Mumbai, etc.), provide local travel insights split into three JSON keys:
1. "localTransitGuide": Detailed markdown bullet points detailing specific local train lines, metro lines (with relevant station names if applicable), specific local bus numbers/routes (e.g. MTC for Chennai, BMTC for Bangalore, BEST for Mumbai), and specific local auto-rickshaw bargaining advice.
2. "roadAdvisory": Local road details, traffic bottlenecks, construction blocks, and road quality.
3. "timeSensitiveTips": Best times to travel, weather alerts, or night/peak-hour fare inflation warnings (e.g. night auto charges 1.5x standard).

Provide the output strictly in valid JSON format matching this structure:
{
  "localTransitGuide": "...",
  "roadAdvisory": "...",
  "timeSensitiveTips": "..."
}
Do not write markdown formatting tags around the JSON output, just output the pure JSON string.`;

      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanJson = responseText.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
      const parsedInsights = JSON.parse(cleanJson);
      if (parsedInsights.localTransitGuide) {
        aiInsights = parsedInsights;
      }
    } catch (error: any) {
      console.error('Gemini Insights error, utilizing mock data:', error.message);
    }
  }

  res.json({
    fares,
    aiInsights
  });
});

// 4. AI Transit Assistant Chatbot
app.post('/api/chat', async (req: Request, res: Response) => {
  const { city, startName, endName, fares, userInput } = req.body;
  
  const currentCity = city || 'Chennai';
  const distanceKm = fares ? fares.distance : 'N/A';
  const durationMins = fares ? fares.duration : 'N/A';
  
  const cabHatch = fares ? fares.cab.hatchback : 'N/A';
  const cabSedan = fares ? fares.cab.sedan : 'N/A';
  const cabSUV = fares ? fares.cab.suv : 'N/A';
  
  const autoOfficial = fares ? fares.auto.official : 'N/A';
  const autoStreetMin = fares ? fares.auto.streetMin : 'N/A';
  const autoStreetMax = fares ? fares.auto.streetMax : 'N/A';
  
  const metroFare = fares ? fares.public.metro : 'N/A';
  const busFare = fares ? fares.public.bus : 'N/A';

  const systemPrompt = `You are "MetriGo Assistant", a friendly, highly intelligent local transit expert in India.
Your goal is to help passengers calculate their fares, understand directions, select transport options, and navigate cities easily.

Context of current search:
- City: ${currentCity}
- Origin: "${startName}"
- Destination: "${endName}"
- Road Distance: ${distanceKm} km
- Driving Duration: ${durationMins} minutes

Calculated fares for this route:
1. Cab (Ola/Uber/Rapido):
   - Hatchback: ₹${cabHatch}
   - Sedan: ₹${cabSedan}
   - SUV: ₹${cabSUV}
2. Auto Rickshaw:
   - Official Meter: ₹${autoOfficial}
   - Flat/Street rates: ₹${autoStreetMin} to ₹${autoStreetMax}
3. Public Transport:
   - Metro: ₹${metroFare}
   - Local Bus: ₹${busFare}

User Message: "${userInput}"
Provide a helpful, precise reply using this context. Keep it short and readable.`;

  let assistantReply = '';

  if (aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(systemPrompt);
      assistantReply = result.response.text().trim();
    } catch (error: any) {
      console.error('Gemini Chat error, using fallback:', error.message);
    }
  }

  // Fallback response generator if Gemini is offline
  if (!assistantReply) {
    const q = userInput.toLowerCase();
    if (q.includes('cab') || q.includes('taxi') || q.includes('car')) {
      assistantReply = `For a cab from ${startName} to ${endName}, the hatchback fare is estimated at ₹${cabHatch}. A sedan will be about ₹${cabSedan}, and an SUV is around ₹${cabSUV}. These rates are calculated based on a distance of ${distanceKm} km and travel time of ${durationMins} minutes.`;
    } else if (q.includes('auto') || q.includes('rickshaw') || q.includes('bargain')) {
      assistantReply = `The official government meter fare for this ride is ₹${autoOfficial}. However, local auto drivers on the street typically charge a flat rate between ₹${autoStreetMin} and ₹${autoStreetMax}. I recommend checking ride-hailing apps (like Ola/Uber Auto) for a stable price!`;
    } else if (q.includes('metro') || q.includes('bus') || q.includes('train') || q.includes('cheapest') || q.includes('cheap')) {
      assistantReply = `The cheapest option would be public transport. The local bus fare is ₹${busFare} and a Metro ticket is around ₹${metroFare}. Depending on the exact station proximity in ${currentCity}, this will save you a lot of money!`;
    } else {
      assistantReply = `I am here to help you navigate your travel in ${currentCity}. The distance from ${startName} to ${endName} is ${distanceKm} km, and takes about ${durationMins} minutes. Fares are estimated at ₹${cabHatch} for cabs, ₹${autoStreetMin}-₹${autoStreetMax} for autos, and around ₹${metroFare}-₹${busFare} for public transport. What specific question do you have?`;
    }
  }

  res.json({ message: assistantReply });
});

// GET Journey History
app.get('/api/history', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  try {
    const journeys = await loadHistory();
    const filteredJourneys = sessionId
      ? journeys.filter((entry: any) => entry.sessionId === sessionId)
      : journeys;

    const sortedJourneys = filteredJourneys.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(sortedJourneys);
  } catch (error: any) {
    console.error('Error fetching history:', error.stack || error.message);
    res.status(500).json({ error: 'Failed to read journey history' });
  }
});

// POST Save Journey to History
app.post('/api/history', async (req: Request, res: Response) => {
  const { sessionId, city, startName, endName, startCoords, endCoords, routePath, fares, aiInsights } = req.body;
  if (!city || !startName || !endName || !fares || !startCoords || !endCoords || !routePath) {
    return res.status(400).json({ error: 'Missing required fields for journey history' });
  }

  try {
    const session = sessionId || 'default';
    const journeys = await loadHistory();

    const filtered = journeys.filter((entry: any) => {
      return !(entry.sessionId === session && entry.city === city && entry.startName === startName && entry.endName === endName);
    });

    const newJourney = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: session,
      city,
      startName,
      endName,
      startCoords,
      endCoords,
      routePath,
      fares,
      aiInsights: aiInsights || null
    };

    filtered.unshift(newJourney);
    await saveHistory(filtered);
    res.status(201).json(newJourney);
  } catch (error: any) {
    console.error('Error saving history:', error.message);
    res.status(500).json({ error: 'Failed to save journey history' });
  }
});

// DELETE Journey from History
app.delete('/api/history/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const sessionId = req.query.sessionId as string || 'default';

  try {
    const journeys = await loadHistory();
    const remaining = journeys.filter((entry: any) => !(entry.id === id && entry.sessionId === sessionId));
    await saveHistory(remaining);
    res.json({ success: true, message: 'Journey history item deleted' });
  } catch (error: any) {
    console.error('Error deleting history item:', error.message);
    res.status(500).json({ error: 'Failed to delete journey history item' });
  }
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`MetriGo backend server running on port ${PORT}`);
  });
}

export default app;
