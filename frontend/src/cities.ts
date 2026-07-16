export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  defaultStart: string;
  defaultEnd: string;
  hasMetro: boolean;
  popularPlaces?: string[];
}

export const CITIES: City[] = [
  {
    name: 'Chennai',
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
    hasMetro: true,
    defaultStart: 'Anna Nagar, Chennai',
    defaultEnd: 'T Nagar, Chennai',
    popularPlaces: ['Marina Beach', 'Chennai Central', 'Guindy', 'Tambaram']
  },
  {
    name: 'Bangalore',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    hasMetro: true,
    defaultStart: 'Indiranagar, Bangalore',
    defaultEnd: 'Koramangala, Bangalore',
    popularPlaces: ['Electronic City', 'Whitefield', 'Majestic', 'HSR Layout']
  },
  {
    name: 'Mumbai',
    country: 'India',
    lat: 19.0760,
    lon: 72.8777,
    hasMetro: true,
    defaultStart: 'Bandra, Mumbai',
    defaultEnd: 'Andheri, Mumbai',
    popularPlaces: ['Gateway of India', 'Chhatrapati Shivaji Terminus', 'Juhu Beach', 'Bandra W', 'Vashi']
  },
  {
    name: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
    hasMetro: true,
    defaultStart: 'Connaught Place, Delhi',
    defaultEnd: 'Noida Sector 62, Delhi',
    popularPlaces: ['Karol Bagh', 'Hauz Khas', 'Chandni Chowk', 'IGI Airport']
  },
  {
    name: 'Kolkata',
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
    hasMetro: true,
    defaultStart: 'Salt Lake, Kolkata',
    defaultEnd: 'Howrah, Kolkata',
    popularPlaces: ['Park Street', 'Esplanade', 'Salt Lake', 'Howrah Bridge']
  },
  {
    name: 'Hyderabad',
    country: 'India',
    lat: 17.3850,
    lon: 78.4867,
    hasMetro: true,
    defaultStart: 'Gachibowli, Hyderabad',
    defaultEnd: 'Secunderabad, Hyderabad',
    popularPlaces: ['HITEC City', 'Charminar', 'Golconda Fort', 'Banjara Hills']
  },
  {
    name: 'Pune',
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
    hasMetro: false,
    defaultStart: 'Kothrud, Pune',
    defaultEnd: 'Viman Nagar, Pune',
    popularPlaces: ['Shaniwar Wada', 'FC Road', 'Koregaon Park', 'Pune Airport']
  },
  {
    name: 'Ranchi',
    country: 'India',
    lat: 23.3441,
    lon: 85.3096,
    hasMetro: false,
    defaultStart: 'Lalpur, Ranchi',
    defaultEnd: 'Kanke Road, Ranchi',
    popularPlaces: ['Ranchi Junction', 'Albert Ekka Chowk', 'Hatia', 'Morhabadi']
  },
  {
    name: 'Rajkot',
    country: 'India',
    lat: 22.3039,
    lon: 70.8022,
    hasMetro: false,
    defaultStart: 'Kalawad Road, Rajkot',
    defaultEnd: 'Yagnik Road, Rajkot',
    popularPlaces: ['Race Course', 'Vadsar', 'Jamnagar Road']
  },
  {
    name: 'Raipur',
    country: 'India',
    lat: 21.2514,
    lon: 81.6296,
    hasMetro: false,
    defaultStart: 'Pandri, Raipur',
    defaultEnd: 'Tatibandh, Raipur',
    popularPlaces: ['Purani Basti', 'Haldwani', 'Telibandha', 'Shankar Nagar']
  },
  {
    name: 'Rishikesh',
    country: 'India',
    lat: 30.0869,
    lon: 78.2676,
    hasMetro: false,
    defaultStart: 'Triveni Ghat, Rishikesh',
    defaultEnd: 'Laxman Jhula, Rishikesh',
    popularPlaces: ['Ram Jhula', 'Neelkanth Mahadev', 'Parmarth Niketan']
  },
  {
    name: 'Rohtak',
    country: 'India',
    lat: 28.8955,
    lon: 76.6066,
    hasMetro: false,
    defaultStart: 'Delhi Road, Rohtak',
    defaultEnd: 'Sector 14, Rohtak',
    popularPlaces: ['Malik Bazaar', 'Rai District Hospital']
  },
  {
    name: 'Surat',
    country: 'India',
    lat: 21.1702,
    lon: 72.8311,
    hasMetro: false,
    defaultStart: 'Adajan, Surat',
    defaultEnd: 'Dumas Road, Surat',
    popularPlaces: ['Surat Diamond Bourse', 'Gopi Talav', 'Adajan']
  },
  {
    name: 'Ahmedabad',
    country: 'India',
    lat: 23.0225,
    lon: 72.5714,
    hasMetro: false,
    defaultStart: 'Satellite, Ahmedabad',
    defaultEnd: 'Vastrapur, Ahmedabad',
    popularPlaces: ['Sabarmati Ashram', 'Manek Chowk', 'Kankaria Lake']
  },
  {
    name: 'Lucknow',
    country: 'India',
    lat: 26.8467,
    lon: 80.9462,
    hasMetro: false,
    defaultStart: 'Hazratganj, Lucknow',
    defaultEnd: 'Gomti Nagar, Lucknow',
    popularPlaces: ['Aminabad', 'Bara Imambara', 'Charbagh']
  },
  {
    name: 'Jaipur',
    country: 'India',
    lat: 26.9124,
    lon: 75.7873,
    hasMetro: false,
    defaultStart: 'Vaishali Nagar, Jaipur',
    defaultEnd: 'C Scheme, Jaipur',
    popularPlaces: ['Hawa Mahal', 'Amber Fort', 'MI Road']
  },
  {
    name: 'Patna',
    country: 'India',
    lat: 25.5941,
    lon: 85.1376,
    hasMetro: false,
    defaultStart: 'Patna Junction Railway Station',
    defaultEnd: 'Patliputra Colony, Patna',
    popularPlaces: ['Ashok Rajpath', 'Bailey Road', 'Kankarbagh']
  },
  {
    name: 'Jamshedpur',
    country: 'India',
    lat: 22.8046,
    lon: 86.2029,
    hasMetro: false,
    defaultStart: 'Bistupur, Jamshedpur',
    defaultEnd: 'Sakchi, Jamshedpur',
    popularPlaces: ['Jubilee Park', 'Tatanagar', 'Milan Chowk']
  },
  {
    name: 'Indore',
    country: 'India',
    lat: 22.7196,
    lon: 75.8577,
    hasMetro: false,
    defaultStart: 'Vijay Nagar, Indore',
    defaultEnd: 'Palasia, Indore',
    popularPlaces: ['Rajwada', 'Sarafa Bazaar', 'Bada Ganapati']
  },
  {
    name: 'Kochi',
    country: 'India',
    lat: 9.9312,
    lon: 76.2673,
    hasMetro: false,
    defaultStart: 'Ernakulam Junction, Kochi',
    defaultEnd: 'Kakkanad, Kochi',
    popularPlaces: ['Marine Drive', 'Fort Kochi', 'Vytilla']
  },
  {
    name: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.0060,
    hasMetro: true,
    defaultStart: 'Times Square, New York',
    defaultEnd: 'Central Park, New York',
    popularPlaces: ['Grand Central Terminal', 'JFK Airport', 'Wall Street', 'Brooklyn Bridge']
  },
  {
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    hasMetro: true,
    defaultStart: 'Covent Garden, London',
    defaultEnd: "King's Cross, London",
    popularPlaces: ['Heathrow Airport', 'Westminster', 'Piccadilly Circus', 'London Bridge']
  },
  {
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
    hasMetro: true,
    defaultStart: 'Eiffel Tower, Paris',
    defaultEnd: 'Louvre Museum, Paris',
    popularPlaces: ['Champs-Élysées', 'Gare du Nord', 'Montmartre', 'Notre-Dame']
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6895,
    lon: 139.6917,
    hasMetro: true,
    defaultStart: 'Shinjuku, Tokyo',
    defaultEnd: 'Shibuya, Tokyo',
    popularPlaces: ['Tokyo Station', 'Narita Airport', 'Akihabara', 'Ueno']
  },
  {
    name: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    hasMetro: true,
    defaultStart: 'Circular Quay, Sydney',
    defaultEnd: 'Sydney Opera House, Sydney',
    popularPlaces: ['Bondi Beach', 'Darling Harbour', 'Sydney Airport']
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.2048,
    lon: 55.2708,
    hasMetro: true,
    defaultStart: 'Burj Khalifa, Dubai',
    defaultEnd: 'Dubai Mall, Dubai',
    popularPlaces: ['DXB Airport', 'Marina', 'Deira']
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    hasMetro: true,
    defaultStart: 'Marina Bay Sands, Singapore',
    defaultEnd: 'Changi Airport, Singapore',
    popularPlaces: ['Orchard Road', 'Sentosa', 'Raffles Place']
  },
  {
    name: 'Berlin',
    country: 'Germany',
    lat: 52.5200,
    lon: 13.4050,
    hasMetro: true,
    defaultStart: 'Alexanderplatz, Berlin',
    defaultEnd: 'Brandenburg Gate, Berlin',
    popularPlaces: ['Hauptbahnhof', 'Checkpoint Charlie', 'Potsdamer Platz']
  },
  {
    name: 'Madrid',
    country: 'Spain',
    lat: 40.4168,
    lon: -3.7038,
    hasMetro: true,
    defaultStart: 'Puerta del Sol, Madrid',
    defaultEnd: 'Chamartín Station, Madrid',
    popularPlaces: ['Plaza Mayor', 'Retiro Park', 'Prado Museum']
  },
  {
    name: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lon: -79.3832,
    hasMetro: true,
    defaultStart: 'Union Station, Toronto',
    defaultEnd: 'CN Tower, Toronto',
    popularPlaces: ['Scarborough', 'Yonge-Dundas Square', 'Toronto Pearson Airport']
  }
];
