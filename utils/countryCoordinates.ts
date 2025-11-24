// Country coordinates mapping using ISO 3166-1 alpha-2 country codes (2-letter format)
export type CountryData = {
  lat: number;
  lng: number;
  zoom: number;
  name: string;
};

export const countryCoordinates: Record<string, CountryData> = {
  // Middle East
  PS: { lat: 31.9522, lng: 35.2332, zoom: 7, name: "Palestine" },
  SY: { lat: 34.8021, lng: 38.9968, zoom: 6, name: "Syria" },
  YE: { lat: 15.5527, lng: 48.5164, zoom: 6, name: "Yemen" },
  PK: { lat: 30.3753, lng: 69.3451, zoom: 6, name: "Pakistan" },
  BD: { lat: 23.685, lng: 90.3563, zoom: 7, name: "Bangladesh" },
  TR: { lat: 38.9637, lng: 35.2433, zoom: 6, name: "Turkey" },
  LB: { lat: 33.8547, lng: 35.8623, zoom: 8, name: "Lebanon" },
  JO: { lat: 30.5852, lng: 36.2384, zoom: 7, name: "Jordan" },
  IQ: { lat: 33.2232, lng: 43.6793, zoom: 6, name: "Iraq" },
  AF: { lat: 33.9391, lng: 67.71, zoom: 6, name: "Afghanistan" },
  SA: { lat: 23.8859, lng: 45.0792, zoom: 6, name: "Saudi Arabia" },
  AE: { lat: 23.4241, lng: 53.8478, zoom: 7, name: "United Arab Emirates" },
  EG: { lat: 26.8206, lng: 30.8025, zoom: 6, name: "Egypt" },

  // Asia & Oceania
  ID: { lat: -0.7893, lng: 113.9213, zoom: 5, name: "Indonesia" },
  IN: { lat: 20.5937, lng: 78.9629, zoom: 5, name: "India" },
  LK: { lat: 7.8731, lng: 80.7718, zoom: 7, name: "Sri Lanka" },
  MY: { lat: 4.2105, lng: 101.9758, zoom: 6, name: "Malaysia" },
  PH: { lat: 12.8797, lng: 121.774, zoom: 6, name: "Philippines" },
  TH: { lat: 15.87, lng: 100.9925, zoom: 6, name: "Thailand" },
  MM: { lat: 21.9162, lng: 95.956, zoom: 6, name: "Myanmar" },
  AU: { lat: -25.2744, lng: 133.7751, zoom: 4, name: "Australia" },

  // Africa
  SO: { lat: 5.1521, lng: 46.1996, zoom: 6, name: "Somalia" },
  SD: { lat: 12.8628, lng: 30.2176, zoom: 6, name: "Sudan" },
  ET: { lat: 9.145, lng: 38.7667, zoom: 6, name: "Ethiopia" },
  KE: { lat: -0.0236, lng: 37.9062, zoom: 6, name: "Kenya" },
  TZ: { lat: -6.369, lng: 34.8888, zoom: 6, name: "Tanzania" },
  UG: { lat: 1.3733, lng: 32.2903, zoom: 7, name: "Uganda" },
  ZA: { lat: -30.5595, lng: 22.9375, zoom: 5, name: "South Africa" },
  NG: { lat: 9.082, lng: 8.6753, zoom: 6, name: "Nigeria" },
  BF: { lat: 12.2383, lng: -1.5616, zoom: 7, name: "Burkina Faso" },
  NE: { lat: 17.6078, lng: 8.0817, zoom: 6, name: "Niger" },
  ML: { lat: 17.5707, lng: -3.9962, zoom: 6, name: "Mali" },
  TD: { lat: 15.4542, lng: 18.7322, zoom: 6, name: "Chad" },
};

// Helper function to get country coordinates by country code or name
export const getCountryCoordinates = (
  countryIdentifier: string | null | undefined
): CountryData => {
  if (!countryIdentifier) {
    return { lat: 20, lng: 0, zoom: 2, name: "Unknown" };
  }

  const normalized = countryIdentifier.trim().toUpperCase();

  // First, try direct 2-letter code match
  if (countryCoordinates[normalized]) {
    return countryCoordinates[normalized];
  }

  // Then, try to find by country name (case-insensitive partial match)
  const match = Object.entries(countryCoordinates).find(([code, data]) => {
    const countryName = data.name.toLowerCase();
    const searchTerm = normalized.toLowerCase();
    return (
      countryName.includes(searchTerm) ||
      searchTerm.includes(countryName) ||
      code === normalized
    );
  });

  return match
    ? countryCoordinates[match[0]]
    : { lat: 20, lng: 0, zoom: 2, name: "Unknown" };
};
