// Kenya political seat simulation data
export type SeatLevel = "president" | "governor" | "senator" | "mp" | "mca";

export type PoliticalSeat = {
  id: string;
  level: SeatLevel;
  title: string;
  region: string;
  county?: string;
  coords: [number, number]; // [lng, lat]
  sentiment: number; // -100 to 100
  influence: number; // 0 to 100
  mentions: string;
  party: string;
  trend: "up" | "down" | "flat";
};

const COUNTIES: { name: string; coords: [number, number] }[] = [
  { name: "Nairobi", coords: [36.8219, -1.2921] },
  { name: "Mombasa", coords: [39.6682, -4.0435] },
  { name: "Kisumu", coords: [34.7617, -0.0917] },
  { name: "Nakuru", coords: [36.0667, -0.3031] },
  { name: "Uasin Gishu", coords: [35.2698, 0.5143] },
  { name: "Nyeri", coords: [36.9476, -0.4201] },
  { name: "Kakamega", coords: [34.7519, 0.2827] },
  { name: "Garissa", coords: [39.6583, -0.4569] },
  { name: "Machakos", coords: [37.2634, -1.5177] },
  { name: "Kericho", coords: [35.2832, -0.3689] },
  { name: "Meru", coords: [37.6559, 0.0463] },
  { name: "Kiambu", coords: [36.8333, -1.1714] },
  { name: "Bungoma", coords: [34.5606, 0.5635] },
  { name: "Kilifi", coords: [39.8499, -3.6309] },
  { name: "Turkana", coords: [35.6, 3.5] },
  { name: "Marsabit", coords: [37.99, 2.33] },
  { name: "Kitui", coords: [38.01, -1.37] },
  { name: "Kisii", coords: [34.77, -0.68] },
  { name: "Bomet", coords: [35.34, -0.78] },
  { name: "Kajiado", coords: [36.78, -1.85] },
];

const PARTIES = ["UDA", "ODM", "Jubilee", "Wiper", "ANC", "Independent", "DAP-K"];

const rand = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const generateSeats = (): PoliticalSeat[] => {
  const seats: PoliticalSeat[] = [];

  seats.push({
    id: "president",
    level: "president",
    title: "President of Kenya",
    region: "National",
    coords: [36.8219, -1.2921],
    sentiment: 12,
    influence: 100,
    mentions: "8.4M",
    party: "UDA",
    trend: "up",
  });

  COUNTIES.forEach((c, i) => {
    seats.push({
      id: `gov-${c.name}`,
      level: "governor",
      title: `Governor – ${c.name}`,
      region: c.name,
      county: c.name,
      coords: c.coords,
      sentiment: Math.round(rand(i + 1) * 140 - 60),
      influence: 60 + Math.round(rand(i + 2) * 40),
      mentions: `${(0.3 + rand(i + 3) * 1.8).toFixed(1)}M`,
      party: PARTIES[Math.floor(rand(i + 4) * PARTIES.length)],
      trend: rand(i + 5) > 0.5 ? "up" : "down",
    });
    seats.push({
      id: `sen-${c.name}`,
      level: "senator",
      title: `Senator – ${c.name}`,
      region: c.name,
      county: c.name,
      coords: [c.coords[0] + 0.05, c.coords[1] + 0.05],
      sentiment: Math.round(rand(i + 11) * 140 - 60),
      influence: 45 + Math.round(rand(i + 12) * 40),
      mentions: `${(0.1 + rand(i + 13) * 1.2).toFixed(1)}M`,
      party: PARTIES[Math.floor(rand(i + 14) * PARTIES.length)],
      trend: rand(i + 15) > 0.5 ? "up" : "down",
    });
    // 3 MPs per county sample
    for (let m = 0; m < 3; m++) {
      seats.push({
        id: `mp-${c.name}-${m}`,
        level: "mp",
        title: `MP – ${c.name} Constituency ${m + 1}`,
        region: c.name,
        county: c.name,
        coords: [c.coords[0] + rand(i + m + 20) * 0.3 - 0.15, c.coords[1] + rand(i + m + 30) * 0.3 - 0.15],
        sentiment: Math.round(rand(i + m + 40) * 140 - 60),
        influence: 25 + Math.round(rand(i + m + 50) * 50),
        mentions: `${Math.round(50 + rand(i + m + 60) * 800)}K`,
        party: PARTIES[Math.floor(rand(i + m + 70) * PARTIES.length)],
        trend: rand(i + m + 80) > 0.5 ? "up" : "down",
      });
    }
    // 5 MCAs per county sample
    for (let w = 0; w < 5; w++) {
      seats.push({
        id: `mca-${c.name}-${w}`,
        level: "mca",
        title: `MCA – ${c.name} Ward ${w + 1}`,
        region: c.name,
        county: c.name,
        coords: [c.coords[0] + rand(i + w + 100) * 0.4 - 0.2, c.coords[1] + rand(i + w + 110) * 0.4 - 0.2],
        sentiment: Math.round(rand(i + w + 120) * 140 - 60),
        influence: 10 + Math.round(rand(i + w + 130) * 40),
        mentions: `${Math.round(5 + rand(i + w + 140) * 200)}K`,
        party: PARTIES[Math.floor(rand(i + w + 150) * PARTIES.length)],
        trend: rand(i + w + 160) > 0.5 ? "up" : "down",
      });
    }
  });

  return seats;
};

export const SEAT_COLORS: Record<SeatLevel, string> = {
  president: "hsl(265 95% 70%)",
  governor: "hsl(205 100% 65%)",
  senator: "hsl(150 85% 55%)",
  mp: "hsl(38 95% 60%)",
  mca: "hsl(0 75% 65%)",
};

export const SEAT_RADIUS: Record<SeatLevel, number> = {
  president: 14,
  governor: 9,
  senator: 7,
  mp: 5,
  mca: 3.5,
};
