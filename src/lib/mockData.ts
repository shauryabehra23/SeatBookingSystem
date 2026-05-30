export interface Venue {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  category: "Concert" | "Show" | "Comedy" | "Sports" | "Theater";
  date: string;
  time: string;
  venue: string;
  description: string;
  banner: string;
  basePrice: number;
  venueId: string;
}

const VENUES: Record<string, Venue> = {
  "1": {
    id: "1",
    name: "Grand Arena",
    city: "Mumbai",
    capacity: 10000,
  },
  "2": {
    id: "2",
    name: "Ramlila Ground",
    city: "Delhi",
    capacity: 50000,
  },
  "3": {
    id: "3",
    name: "Amanora Park",
    city: "Pune",
    capacity: 5000,
  },
};

export const EVENTS: Event[] = [
  {
    id: "1",
    title: "Coldplay Live in Mumbai",
    category: "Concert",
    date: "June 15, 2026",
    time: "7:00 PM",
    venue: "Grand Arena",
    venueId: "1",
    description:
      "Experience the magic of Coldplay with their greatest hits and new compositions.",
    banner:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop",
    basePrice: 2500,
  },
  {
    id: "2",
    title: "Stand-up Comedy Night",
    category: "Comedy",
    date: "June 20, 2026",
    time: "8:00 PM",
    venue: "Amanora Park",
    venueId: "3",
    description: "Laugh out loud with India's top comedians.",
    banner:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
    basePrice: 800,
  },
  {
    id: "3",
    title: "Cricket World Cup Final",
    category: "Sports",
    date: "July 5, 2026",
    time: "3:00 PM",
    venue: "Ramlila Ground",
    venueId: "2",
    description: "The most anticipated cricket match of the year.",
    banner:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
    basePrice: 5000,
  },
  {
    id: "4",
    title: "Theater Production - Hamlet",
    category: "Theater",
    date: "June 25, 2026",
    time: "7:30 PM",
    venue: "Grand Arena",
    venueId: "1",
    description: "A classic adaptation of Shakespeare's masterpiece.",
    banner:
      "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=400&fit=crop",
    basePrice: 1500,
  },
];

export async function getEventById(id: string): Promise<Event | null> {
  await new Promise((r) => setTimeout(r, 300));
  return EVENTS.find((e) => e.id === id) || null;
}

export async function getVenueById(id: string): Promise<Venue | null> {
  await new Promise((r) => setTimeout(r, 200));
  return VENUES[id] || null;
}

export async function getAllEvents(): Promise<Event[]> {
  await new Promise((r) => setTimeout(r, 200));
  return EVENTS;
}
