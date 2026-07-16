export type Fares = {
  distance: string;
  duration: number;
  cab: { hatchback: number; sedan: number; suv: number };
  auto: { official: number; streetMin: number; streetMax: number };
  public: { metro: number; bus: number };
};

export type AIInsights = {
  localTransitGuide: string;
  roadAdvisory: string;
  timeSensitiveTips: string;
};

export type GeocodeResult = {
  display_name: string;
  lat: string;
  lon: string;
  properties?: Record<string, any>;
};

export const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

const PHOTON_URL = 'https://photon.komoot.io/api/';

function buildDisplayName(properties: Record<string, any>) {
  const fields = [
    properties.name,
    properties.street,
    properties.city,
    properties.state,
    properties.country
  ].filter(Boolean);
  return fields.join(', ') || 'Unknown location';
}

export async function geocodeLocation(query: string): Promise<GeocodeResult[]> {
  const url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=8&lang=en`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MetriGo-Transit-App/1.0'
    }
  });

  if (!res.ok) {
    throw new Error('Failed to resolve location');
  }

  const data = await res.json();
  if (!data?.features || !Array.isArray(data.features)) return [];

  return data.features.map((feature: any) => {
    const properties = feature.properties || {};
    return {
      display_name: buildDisplayName(properties),
      lat: String(feature.geometry.coordinates[1]),
      lon: String(feature.geometry.coordinates[0]),
      properties
    };
  });
}

export function calculateFares(distanceKm: number, durationMin: number, city = 'Chennai'): Fares {
  const cleanCity = (city || 'Chennai').toLowerCase().trim();
  const distance = distanceKm;
  const duration = durationMin;
  const cabBase = 50;
  const cabHatch = Math.round(cabBase + distance * 14 + duration * 1.5);
  const cabSedan = Math.round(cabBase * 1.2 + distance * 18 + duration * 2);
  const cabSUV = Math.round(cabBase * 1.6 + distance * 24 + duration * 2.5);

  let autoOfficial = 0;
  let autoStreetMin = 0;
  let autoStreetMax = 0;

  if (cleanCity.includes('mumbai')) {
    autoOfficial = distance <= 1.5 ? 23 : Math.round(23 + (distance - 1.5) * 15.33);
    autoStreetMin = Math.round(40 + distance * 16);
    autoStreetMax = Math.round(70 + distance * 22);
  } else if (cleanCity.includes('delhi')) {
    autoOfficial = distance <= 1.5 ? 30 : Math.round(30 + (distance - 1.5) * 11);
    autoStreetMin = Math.round(50 + distance * 13);
    autoStreetMax = Math.round(80 + distance * 18);
  } else if (cleanCity.includes('bangalore') || cleanCity.includes('bengaluru')) {
    autoOfficial = distance <= 1.9 ? 30 : Math.round(30 + (distance - 1.9) * 15);
    autoStreetMin = Math.round(60 + distance * 18);
    autoStreetMax = Math.round(90 + distance * 24);
  } else if (cleanCity.includes('chennai')) {
    autoOfficial = distance <= 1.8 ? 30 : Math.round(30 + (distance - 1.8) * 15);
    autoStreetMin = Math.round(75 + distance * 20);
    autoStreetMax = Math.round(110 + distance * 26);
  } else {
    autoOfficial = distance <= 1.5 ? 25 : Math.round(25 + (distance - 1.5) * 12);
    autoStreetMin = Math.round(50 + distance * 15);
    autoStreetMax = Math.round(80 + distance * 20);
  }

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

export function generateMockInsights(city: string, startName: string, endName: string, fares: Fares): AIInsights {
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
  }

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

export function generateTransitAssistantReply(city: string, startName: string, endName: string, fares: Fares | null, userInput: string) {
  const currentCity = city || 'your city';
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

  const q = userInput.toLowerCase();
  if (q.includes('cab') || q.includes('taxi') || q.includes('car')) {
    return `For a cab from ${startName} to ${endName}, the hatchback fare is estimated at ₹${cabHatch}. A sedan will be about ₹${cabSedan}, and an SUV is around ₹${cabSUV}. These rates are based on a distance of ${distanceKm} km and travel time of ${durationMins} minutes.`;
  }

  if (q.includes('auto') || q.includes('rickshaw') || q.includes('bargain')) {
    return `The official government meter fare for this ride is ₹${autoOfficial}. However, local auto drivers on the street typically charge a flat rate between ₹${autoStreetMin} and ₹${autoStreetMax}. I recommend checking ride-hailing apps for a stable auto price.`;
  }

  if (q.includes('metro') || q.includes('bus') || q.includes('train') || q.includes('cheapest') || q.includes('cheap')) {
    return `The cheapest option would be public transport. The local bus fare is ₹${busFare} and a Metro ticket is around ₹${metroFare}. Depending on the exact station proximity, this will save you a lot of money.`;
  }

  return `I am here to help you navigate your travel in ${currentCity}. The distance from ${startName} to ${endName} is ${distanceKm} km and takes about ${durationMins} minutes. Fares are estimated at ₹${cabHatch} for cabs, ₹${autoStreetMin}-₹${autoStreetMax} for autos, and around ₹${metroFare}-₹${busFare} for public transport. What specific question do you have?`;
}

export type NegotiationResponse = {
  message: string;
  status: 'negotiating' | 'accepted' | 'rejected';
  finalFare: number | null;
  bargainScore: number | null;
};

export function generateNegotiationResponse(city: string, startName: string, endName: string, fares: Fares | null, userInput: string): NegotiationResponse {
  const minPrice = fares?.auto.streetMin ?? 0;
  const maxPrice = fares?.auto.streetMax ?? 0;
  const offerMatch = userInput.match(/(\d+(?:\.\d+)?)/g);
  const offer = offerMatch ? parseFloat(offerMatch.pop() || '0') : null;

  const response: NegotiationResponse = {
    message: '',
    status: 'negotiating',
    finalFare: null,
    bargainScore: null
  };

  if (offer !== null && !Number.isNaN(offer) && offer > 0) {
    if (offer <= maxPrice) {
      response.status = 'accepted';
      response.finalFare = Math.round(offer);
      const score = maxPrice > minPrice ? Math.round(100 - ((offer - minPrice) / (maxPrice - minPrice)) * 20) : 90;
      response.bargainScore = Math.max(50, Math.min(100, score));
      response.message = `Alright, ₹${response.finalFare} is a fair price. We can go with that.`;
    } else {
      response.status = 'rejected';
      response.message = `That's too high. My best price is ₹${maxPrice}. Let's keep the fare within that range.`;
    }
  } else {
    response.message = `What's your offer for this ride? A fair street price for this route is ₹${minPrice}-₹${maxPrice}.`;
  }

  return response;
}

