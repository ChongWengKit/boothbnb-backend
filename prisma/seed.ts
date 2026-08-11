/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
 
const prisma = new PrismaClient();

async function main() {
  // 1. Seed initial currencies
  // 2. Ensure a default host exists to own the events
const count = await prisma.currency_exchange.count();

  // 1. Seed initial currency
  if (count === 0) {
    await prisma.currency_exchange.create({
      data: {
        currency: 'USD',
        rate: 1.0,
        is_enabled: true,
      },
    });
  }
  if (process.env.NODE_ENV !== 'dev') {
    return;
  }

  const defaultPassword = 'development';

  // 2.1. Add more vendor users
  const salt1 = crypto.randomBytes(16).toString('hex');
  const hashedPassword1 = crypto.pbkdf2Sync(defaultPassword, salt1, 1000, 64, 'sha512').toString('hex');
  const host = await prisma.users.upsert({
    where: { email: 'anintrovert87+999@gmail.com' },
    update: { password: hashedPassword1, salt: salt1 },
    create: {
      email: 'anintrovert87+999@gmail.com',
      username: 'host_alpha',
      is_verified: true,
      role: 'HOST',
      password: hashedPassword1,
      salt: salt1,
    },
  });
  const salt2 = crypto.randomBytes(16).toString('hex');
  const hashedPassword2 = crypto.pbkdf2Sync(defaultPassword, salt2, 1000, 64, 'sha512').toString('hex');
  const host2 = await prisma.users.upsert({
    where: { email: 'anintrovert87+998@gmail.com' },
    update: { password: hashedPassword2, salt: salt2 },
    create: {
      email: 'anintrovert87+998@gmail.com',
      username: 'host_beta',
      is_verified: true,
      role: 'HOST',
      password: hashedPassword2,
      salt: salt2,
    },
  });

  const locations = [
    // ART_CRAFT
    { name: 'Singapore Art Expo', lat: 1.3521, lng: 103.8198, category: 'ART_CRAFT' },
    { name: 'Rio Carnival Arts', lat: -22.9068, lng: -43.1729, category: 'ART_CRAFT' },
    { name: 'Florence Renaissance Fair', lat: 43.7696, lng: 11.2558, category: 'ART_CRAFT' },
    { name: 'Melbourne Street Art Festival', lat: -37.8136, lng: 144.9631, category: 'ART_CRAFT' },
    { name: 'Barcelona Mosaic Arts', lat: 41.3851, lng: 2.1734, category: 'ART_CRAFT' },
    { name: 'Mumbai Textile Arts Fair', lat: 19.0760, lng: 72.8777, category: 'ART_CRAFT' },
    { name: 'Montreal Mixed Media Expo', lat: 45.5017, lng: -73.5673, category: 'ART_CRAFT' },
    { name: 'Cape Town Craft Collective', lat: -33.9249, lng: 18.4241, category: 'ART_CRAFT' },
    { name: 'Kyoto Ceramics Festival', lat: 35.0116, lng: 135.7681, category: 'ART_CRAFT' },
    { name: 'Amsterdam Print Market', lat: 52.3676, lng: 4.9041, category: 'ART_CRAFT' },

    // FOOD_BEVERAGE
    { name: 'New York Food Festival', lat: 40.7128, lng: -74.0060, category: 'FOOD_BEVERAGE' },
    { name: 'Paris Bakery Convention', lat: 48.8566, lng: 2.3522, category: 'FOOD_BEVERAGE' },
    { name: 'Rome Food & Wine Festival', lat: 41.9028, lng: 12.4964, category: 'FOOD_BEVERAGE' },
    { name: 'Bangkok Street Food Summit', lat: 13.7563, lng: 100.5018, category: 'FOOD_BEVERAGE' },
    { name: 'Mexico City Taco Festival', lat: 19.4326, lng: -99.1332, category: 'FOOD_BEVERAGE' },
    { name: 'Istanbul Spice Bazaar Fest', lat: 41.0082, lng: 28.9784, category: 'FOOD_BEVERAGE' },
    { name: 'Copenhagen Nordic Food Expo', lat: 55.6761, lng: 12.5683, category: 'FOOD_BEVERAGE' },
    { name: 'Lima Ceviche & Cuisine Fair', lat: -12.0464, lng: -77.0428, category: 'FOOD_BEVERAGE' },
    { name: 'Osaka Ramen Championship', lat: 34.6937, lng: 135.5023, category: 'FOOD_BEVERAGE' },
    { name: 'Nairobi Coffee & Tea Expo', lat: -1.2921, lng: 36.8219, category: 'FOOD_BEVERAGE' },
    { name: 'Lagos Jollof Cook-Off', lat: 6.5244, lng: 3.3792, category: 'FOOD_BEVERAGE' },
    { name: 'Buenos Aires Asado Festival', lat: -34.6037, lng: -58.3816, category: 'FOOD_BEVERAGE' },

    // FASHION_BEAUTY
    { name: 'Tokyo Fashion Week', lat: 35.6762, lng: 139.6503, category: 'FASHION_BEAUTY' },
    { name: 'Seoul K-Pop Convention', lat: 37.5665, lng: 126.9780, category: 'FASHION_BEAUTY' },
    { name: 'Milan Couture Showcase', lat: 45.4642, lng: 9.1900, category: 'FASHION_BEAUTY' },
    { name: 'Lagos Afro Fashion Week', lat: 6.5244, lng: 3.3792, category: 'FASHION_BEAUTY' },
    { name: 'Los Angeles Beauty Expo', lat: 34.0522, lng: -118.2437, category: 'FASHION_BEAUTY' },
    { name: 'Stockholm Sustainable Fashion Fair', lat: 59.3293, lng: 18.0686, category: 'FASHION_BEAUTY' },
    { name: 'Dubai Luxury Fashion Show', lat: 25.2048, lng: 55.2708, category: 'FASHION_BEAUTY' },
    { name: 'São Paulo Design Week', lat: -23.5505, lng: -46.6333, category: 'FASHION_BEAUTY' },
    { name: 'Jakarta Batik Festival', lat: -6.2088, lng: 106.8456, category: 'FASHION_BEAUTY' },
    { name: 'Accra Kente Wear Showcase', lat: 5.6037, lng: -0.1870, category: 'FASHION_BEAUTY' },

    // TECH_GADGETS
    { name: 'London Tech Fair', lat: 51.5074, lng: -0.1278, category: 'TECH_GADGETS' },
    { name: 'Dubai Auto Show', lat: 25.2048, lng: 55.2708, category: 'TECH_GADGETS' },
    { name: 'San Francisco AI Summit', lat: 37.7749, lng: -122.4194, category: 'TECH_GADGETS' },
    { name: 'Shenzhen Electronics Expo', lat: 22.5431, lng: 114.0579, category: 'TECH_GADGETS' },
    { name: 'Berlin Future Mobility Show', lat: 52.5200, lng: 13.4050, category: 'TECH_GADGETS' },
    { name: 'Bangalore Startup Showcase', lat: 12.9716, lng: 77.5946, category: 'TECH_GADGETS' },
    { name: 'Helsinki Gaming Convention', lat: 60.1699, lng: 24.9384, category: 'TECH_GADGETS' },
    { name: 'Toronto Robotics Fair', lat: 43.6532, lng: -79.3832, category: 'TECH_GADGETS' },
    { name: 'Tel Aviv Cyber Security Expo', lat: 32.0853, lng: 34.7818, category: 'TECH_GADGETS' },
    { name: 'Taipei Semiconductor Summit', lat: 25.0330, lng: 121.5654, category: 'TECH_GADGETS' },

    // HOME_LIVING
    { name: 'Copenhagen Design Fair', lat: 55.6761, lng: 12.5683, category: 'HOME_LIVING' },
    { name: 'Tokyo Interior Expo', lat: 35.6762, lng: 139.6503, category: 'HOME_LIVING' },
    { name: 'Chicago Home & Garden Show', lat: 41.8781, lng: -87.6298, category: 'HOME_LIVING' },
    { name: 'Stockholm Furniture Fair', lat: 59.3293, lng: 18.0686, category: 'HOME_LIVING' },
    { name: 'Sydney Interiors Festival', lat: -33.8688, lng: 151.2093, category: 'HOME_LIVING' },
    { name: 'Dubai Real Estate & Living Expo', lat: 25.2048, lng: 55.2708, category: 'HOME_LIVING' },
    { name: 'Mumbai Smart Homes Show', lat: 19.0760, lng: 72.8777, category: 'HOME_LIVING' },
    { name: 'Vienna Decor & Living Market', lat: 48.2082, lng: 16.3738, category: 'HOME_LIVING' },

    // CORPORATE_TRADE
    { name: 'Geneva Trade Summit', lat: 46.2044, lng: 6.1432, category: 'CORPORATE_TRADE' },
    { name: 'Hong Kong Business Expo', lat: 22.3193, lng: 114.1694, category: 'CORPORATE_TRADE' },
    { name: 'New York Investment Forum', lat: 40.7128, lng: -74.0060, category: 'CORPORATE_TRADE' },
    { name: 'Frankfurt Finance Fair', lat: 50.1109, lng: 8.6821, category: 'CORPORATE_TRADE' },
    { name: 'Singapore Global Trade Expo', lat: 1.3521, lng: 103.8198, category: 'CORPORATE_TRADE' },
    { name: 'Nairobi Entrepreneurship Summit', lat: -1.2921, lng: 36.8219, category: 'CORPORATE_TRADE' },
    { name: 'Jakarta SME Trade Fair', lat: -6.2088, lng: 106.8456, category: 'CORPORATE_TRADE' },
    { name: 'São Paulo B2B Expo', lat: -23.5505, lng: -46.6333, category: 'CORPORATE_TRADE' },

    // ANIME_COMIC
    { name: 'Tokyo Anime Festival', lat: 35.6762, lng: 139.6503, category: 'ANIME_COMIC' },
    { name: 'Los Angeles Comic Con', lat: 34.0522, lng: -118.2437, category: 'ANIME_COMIC' },
    { name: 'London MCM Expo', lat: 51.5074, lng: -0.1278, category: 'ANIME_COMIC' },
    { name: 'Seoul Webtoon Convention', lat: 37.5665, lng: 126.9780, category: 'ANIME_COMIC' },
    { name: 'Paris Japan Expo', lat: 48.8566, lng: 2.3522, category: 'ANIME_COMIC' },
    { name: 'Sydney Supanova', lat: -33.8688, lng: 151.2093, category: 'ANIME_COMIC' },
    { name: 'Manila Cosplay Festival', lat: 14.5995, lng: 120.9842, category: 'ANIME_COMIC' },
    { name: 'São Paulo Anime Friends', lat: -23.5505, lng: -46.6333, category: 'ANIME_COMIC' },
    { name: 'Bangkok Comic Con', lat: 13.7563, lng: 100.5018, category: 'ANIME_COMIC' },

    // THRIFT_VINTAGE
    { name: 'Berlin Thrift Market', lat: 52.5200, lng: 13.4050, category: 'THRIFT_VINTAGE' },
    { name: 'London Portobello Vintage Fair', lat: 51.5074, lng: -0.1278, category: 'THRIFT_VINTAGE' },
    { name: 'Portland Flea Market', lat: 45.5051, lng: -122.6750, category: 'THRIFT_VINTAGE' },
    { name: 'Amsterdam Vintage Bazaar', lat: 52.3676, lng: 4.9041, category: 'THRIFT_VINTAGE' },
    { name: 'Melbourne Retro Market', lat: -37.8136, lng: 144.9631, category: 'THRIFT_VINTAGE' },
    { name: 'Tokyo Shimokitazawa Flea Market', lat: 35.6614, lng: 139.6680, category: 'THRIFT_VINTAGE' },
    { name: 'New York Brooklyn Flea', lat: 40.7128, lng: -74.0060, category: 'THRIFT_VINTAGE' },
    { name: 'Paris Marche aux Puces', lat: 48.9025, lng: 2.3495, category: 'THRIFT_VINTAGE' },

    // WELLNESS_FITNESS
    { name: 'Sydney Wellness Retreat', lat: -33.8688, lng: 151.2093, category: 'WELLNESS_FITNESS' },
    { name: 'Bali Yoga & Wellness Festival', lat: -8.3405, lng: 115.0920, category: 'WELLNESS_FITNESS' },
    { name: 'Los Angeles Fitness Expo', lat: 34.0522, lng: -118.2437, category: 'WELLNESS_FITNESS' },
    { name: 'Amsterdam Mindfulness Summit', lat: 52.3676, lng: 4.9041, category: 'WELLNESS_FITNESS' },
    { name: 'Dubai Health & Wellness Fair', lat: 25.2048, lng: 55.2708, category: 'WELLNESS_FITNESS' },
    { name: 'Copenhagen Active Living Expo', lat: 55.6761, lng: 12.5683, category: 'WELLNESS_FITNESS' },
    { name: 'Vancouver Outdoor Fitness Fest', lat: 49.2827, lng: -123.1207, category: 'WELLNESS_FITNESS' },
    { name: 'Cape Town Yoga Retreat', lat: -33.9249, lng: 18.4241, category: 'WELLNESS_FITNESS' },

    // PET_FAIR
    { name: 'Tokyo Pet Expo', lat: 35.6762, lng: 139.6503, category: 'PET_FAIR' },
    { name: 'London Crufts Dog Show', lat: 51.5074, lng: -0.1278, category: 'PET_FAIR' },
    { name: 'New York Pet Fashion Show', lat: 40.7128, lng: -74.0060, category: 'PET_FAIR' },
    { name: 'Sydney Petfest', lat: -33.8688, lng: 151.2093, category: 'PET_FAIR' },
    { name: 'Singapore Animal Welfare Fair', lat: 1.3521, lng: 103.8198, category: 'PET_FAIR' },
    { name: 'Toronto Pet Adoption Day', lat: 43.6532, lng: -79.3832, category: 'PET_FAIR' },
    { name: 'Berlin Dog & Cat Convention', lat: 52.5200, lng: 13.4050, category: 'PET_FAIR' },

    // EDUCATIONAL
    { name: 'Cairo Ancient History Expo', lat: 30.0444, lng: 31.2357, category: 'EDUCATIONAL' },
    { name: 'Boston EdTech Summit', lat: 42.3601, lng: -71.0589, category: 'EDUCATIONAL' },
    { name: 'Oxford Academic Fair', lat: 51.7520, lng: -1.2577, category: 'EDUCATIONAL' },
    { name: 'Singapore STEM Olympiad', lat: 1.3521, lng: 103.8198, category: 'EDUCATIONAL' },
    { name: 'Nairobi Science Festival', lat: -1.2921, lng: 36.8219, category: 'EDUCATIONAL' },
    { name: 'Helsinki Innovation Forum', lat: 60.1699, lng: 24.9384, category: 'EDUCATIONAL' },
    { name: 'Mumbai Skills & Careers Expo', lat: 19.0760, lng: 72.8777, category: 'EDUCATIONAL' },
    { name: 'Seoul Future Leaders Summit', lat: 37.5665, lng: 126.9780, category: 'EDUCATIONAL' },

    // OTHERS
    { name: 'Las Vegas Entertainment Expo', lat: 36.1699, lng: -115.1398, category: 'OTHERS' },
    { name: 'New Orleans Jazz & Culture Fest', lat: 29.9511, lng: -90.0715, category: 'OTHERS' },
    { name: 'Edinburgh Fringe Market', lat: 55.9533, lng: -3.1883, category: 'OTHERS' },
    { name: 'Rio Multicultural Bazaar', lat: -22.9068, lng: -43.1729, category: 'OTHERS' },
    { name: 'Marrakech Artisan Souk', lat: 31.6295, lng: -7.9811, category: 'OTHERS' },
    { name: 'Reykjavik Winter Festival', lat: 64.1466, lng: -21.9426, category: 'OTHERS' },
    { name: 'Mumbai Bollywood Mela', lat: 19.0760, lng: 72.8777, category: 'OTHERS' },
  ];

  console.log('Seeding fake events...');

  for (const loc of locations) {
    const slug = loc.name.toLowerCase().replace(/ /g, '-');

    const existingEvent = await prisma.events.findFirst({
      where: { slug: slug }
    });

    if (!existingEvent) {
      const startDate = new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (Math.random() * 4 + 1) * 24 * 60 * 60 * 1000);

      await prisma.events.create({
        data: {
          title: loc.name,
          description: `Experience the best of ${loc.name}! Join us for a unique gathering of vendors and visitors.`,
          address: `Central District, ${loc.name.split(' ')[0]}`,
          category: loc.category as any,
          currency_code: 'USD',
          host_id: host.id,
          latitude: loc.lat,
          longitude: loc.lng,
          status: 'PUBLISHED',
          slug: slug,
          start_date: startDate,
          end_date: endDate,
          booths: { 
            create: Array.from({ length: Math.floor(Math.random() * 16) + 5 }).map((_, i) => ({ 
              name: `Booth ${String.fromCharCode(65 + i)}${i + 1}`, 
              type: 'AVAILABLE',
              x: i * 110, 
              y: 0,
              width: 100,
              height: 100,
              rotation: 0, 
              price: parseFloat((Math.random() * 250 + 25).toFixed(2)), 
              description: `A prime spot at ${loc.name}`
            }
            )),
          },
        },
      });
    }
  }
  // 3. Seed additional events with recent dates (within the last few days to the next few days)
  const recentLocations = [
    // ART_CRAFT
    { name: 'Singapore Art Expo', lat: 1.3521, lng: 103.8198, category: 'ART_CRAFT' },
    { name: 'Bali Craft Bazaar', lat: -8.3405, lng: 115.0920, category: 'ART_CRAFT' },
    { name: 'Bangkok Handmade Fair', lat: 13.7563, lng: 100.5018, category: 'ART_CRAFT' },
    { name: 'Ho Chi Minh Art Market', lat: 10.8231, lng: 106.6297, category: 'ART_CRAFT' },
    { name: 'Manila Craft Expo', lat: 14.5995, lng: 120.9842, category: 'ART_CRAFT' },
    { name: 'Taipei Creative Fair', lat: 25.0330, lng: 121.5654, category: 'ART_CRAFT' },
    { name: 'Seoul Artisan Market', lat: 37.5665, lng: 126.9780, category: 'ART_CRAFT' },
    { name: 'Sydney Makers Market', lat: -33.8688, lng: 151.2093, category: 'ART_CRAFT' },
    { name: 'Auckland Craft Show', lat: -36.8485, lng: 174.7633, category: 'ART_CRAFT' },
    { name: 'Vancouver Art Walk', lat: 49.2827, lng: -123.1207, category: 'ART_CRAFT' },

    // FOOD_BEVERAGE
    { name: 'Tokyo Ramen Fest', lat: 35.6762, lng: 139.6503, category: 'FOOD_BEVERAGE' },
    { name: 'Seoul Street Food Expo', lat: 37.5665, lng: 126.9780, category: 'FOOD_BEVERAGE' },
    { name: 'Hong Kong Dim Sum Fair', lat: 22.3193, lng: 114.1694, category: 'FOOD_BEVERAGE' },
    { name: 'Taipei Night Market Fest', lat: 25.0330, lng: 121.5654, category: 'FOOD_BEVERAGE' },
    { name: 'Manila Food Carnival', lat: 14.5995, lng: 120.9842, category: 'FOOD_BEVERAGE' },
    { name: 'Jakarta Culinary Expo', lat: -6.2088, lng: 106.8456, category: 'FOOD_BEVERAGE' },
    { name: 'Sydney Seafood Festival', lat: -33.8688, lng: 151.2093, category: 'FOOD_BEVERAGE' },
    { name: 'Melbourne Coffee Fest', lat: -37.8136, lng: 144.9631, category: 'FOOD_BEVERAGE' },
    { name: 'Auckland Wine & Dine', lat: -36.8485, lng: 174.7633, category: 'FOOD_BEVERAGE' },
    { name: 'Vancouver Food Truck Fest', lat: 49.2827, lng: -123.1207, category: 'FOOD_BEVERAGE' },

    // FASHION_BEAUTY
    { name: 'Seoul Fashion Week', lat: 37.5665, lng: 126.9780, category: 'FASHION_BEAUTY' },
    { name: 'Bangkok Beauty Expo', lat: 13.7563, lng: 100.5018, category: 'FASHION_BEAUTY' },
    { name: 'Manila Fashion Fair', lat: 14.5995, lng: 120.9842, category: 'FASHION_BEAUTY' },
    { name: 'Jakarta Modest Fashion Show', lat: -6.2088, lng: 106.8456, category: 'FASHION_BEAUTY' },
    { name: 'Sydney Fashion Week', lat: -33.8688, lng: 151.2093, category: 'FASHION_BEAUTY' },
    { name: 'Melbourne Beauty Expo', lat: -37.8136, lng: 144.9631, category: 'FASHION_BEAUTY' },
    { name: 'Vancouver Style Show', lat: 49.2827, lng: -123.1207, category: 'FASHION_BEAUTY' },
    { name: 'Toronto Fashion Fest', lat: 43.6532, lng: -79.3832, category: 'FASHION_BEAUTY' },

    // TECH_GADGETS
    { name: 'Singapore Tech Week', lat: 1.3521, lng: 103.8198, category: 'TECH_GADGETS' },
    { name: 'Seoul AI Summit', lat: 37.5665, lng: 126.9780, category: 'TECH_GADGETS' },
    { name: 'Taipei Tech Expo', lat: 25.0330, lng: 121.5654, category: 'TECH_GADGETS' },
    { name: 'Bangalore Startup Fest', lat: 12.9716, lng: 77.5946, category: 'TECH_GADGETS' },
    { name: 'Sydney Innovation Show', lat: -33.8688, lng: 151.2093, category: 'TECH_GADGETS' },
    { name: 'Vancouver Tech Meetup', lat: 49.2827, lng: -123.1207, category: 'TECH_GADGETS' },
    { name: 'Toronto AI Conference', lat: 43.6532, lng: -79.3832, category: 'TECH_GADGETS' },
    { name: 'London Gadget Expo', lat: 51.5074, lng: -0.1278, category: 'TECH_GADGETS' },

    // HOME_LIVING
    { name: 'Singapore Home Expo', lat: 1.3521, lng: 103.8198, category: 'HOME_LIVING' },
    { name: 'Bangkok Interior Fair', lat: 13.7563, lng: 100.5018, category: 'HOME_LIVING' },
    { name: 'Jakarta Living Show', lat: -6.2088, lng: 106.8456, category: 'HOME_LIVING' },
    { name: 'Sydney Home & Garden', lat: -33.8688, lng: 151.2093, category: 'HOME_LIVING' },
    { name: 'Melbourne Design Week', lat: -37.8136, lng: 144.9631, category: 'HOME_LIVING' },
    { name: 'Toronto Home Show', lat: 43.6532, lng: -79.3832, category: 'HOME_LIVING' },
    { name: 'London Living Fair', lat: 51.5074, lng: -0.1278, category: 'HOME_LIVING' },

    // CORPORATE_TRADE
    { name: 'Singapore Business Forum', lat: 1.3521, lng: 103.8198, category: 'CORPORATE_TRADE' },
    { name: 'Hong Kong Trade Expo', lat: 22.3193, lng: 114.1694, category: 'CORPORATE_TRADE' },
    { name: 'Mumbai Business Summit', lat: 19.0760, lng: 72.8777, category: 'CORPORATE_TRADE' },
    { name: 'Sydney Trade Fair', lat: -33.8688, lng: 151.2093, category: 'CORPORATE_TRADE' },
    { name: 'Toronto Business Expo', lat: 43.6532, lng: -79.3832, category: 'CORPORATE_TRADE' },
    { name: 'London Investment Forum', lat: 51.5074, lng: -0.1278, category: 'CORPORATE_TRADE' },
    { name: 'Dubai Trade Summit', lat: 25.2048, lng: 55.2708, category: 'CORPORATE_TRADE' },

    // ANIME_COMIC
    { name: 'Singapore Anime Fest', lat: 1.3521, lng: 103.8198, category: 'ANIME_COMIC' },
    { name: 'Bangkok Comic Expo', lat: 13.7563, lng: 100.5018, category: 'ANIME_COMIC' },
    { name: 'Manila Anime Carnival', lat: 14.5995, lng: 120.9842, category: 'ANIME_COMIC' },
    { name: 'Jakarta Comic Con', lat: -6.2088, lng: 106.8456, category: 'ANIME_COMIC' },
    { name: 'Sydney Supanova', lat: -33.8688, lng: 151.2093, category: 'ANIME_COMIC' },
    { name: 'Melbourne Comic Fest', lat: -37.8136, lng: 144.9631, category: 'ANIME_COMIC' },
    { name: 'Toronto Anime Expo', lat: 43.6532, lng: -79.3832, category: 'ANIME_COMIC' },
    { name: 'London Comic Con', lat: 51.5074, lng: -0.1278, category: 'ANIME_COMIC' },

    // THRIFT_VINTAGE
    { name: 'Bangkok Vintage Market', lat: 13.7563, lng: 100.5018, category: 'THRIFT_VINTAGE' },
    { name: 'Jakarta Flea Market', lat: -6.2088, lng: 106.8456, category: 'THRIFT_VINTAGE' },
    { name: 'Sydney Retro Bazaar', lat: -33.8688, lng: 151.2093, category: 'THRIFT_VINTAGE' },
    { name: 'Melbourne Vintage Fair', lat: -37.8136, lng: 144.9631, category: 'THRIFT_VINTAGE' },
    { name: 'Toronto Thrift Fest', lat: 43.6532, lng: -79.3832, category: 'THRIFT_VINTAGE' },
    { name: 'London Vintage Market', lat: 51.5074, lng: -0.1278, category: 'THRIFT_VINTAGE' },
    { name: 'Paris Flea Market', lat: 48.8566, lng: 2.3522, category: 'THRIFT_VINTAGE' },

    // WELLNESS_FITNESS
    { name: 'Bali Wellness Retreat', lat: -8.3405, lng: 115.0920, category: 'WELLNESS_FITNESS' },
    { name: 'Bangkok Yoga Fest', lat: 13.7563, lng: 100.5018, category: 'WELLNESS_FITNESS' },
    { name: 'Sydney Fitness Expo', lat: -33.8688, lng: 151.2093, category: 'WELLNESS_FITNESS' },
    { name: 'Melbourne Wellness Fair', lat: -37.8136, lng: 144.9631, category: 'WELLNESS_FITNESS' },
    { name: 'Vancouver Outdoor Fest', lat: 49.2827, lng: -123.1207, category: 'WELLNESS_FITNESS' },
    { name: 'Toronto Health Expo', lat: 43.6532, lng: -79.3832, category: 'WELLNESS_FITNESS' },
    { name: 'London Mindfulness Fair', lat: 51.5074, lng: -0.1278, category: 'WELLNESS_FITNESS' },

    // PET_FAIR
    { name: 'Singapore Pet Expo', lat: 1.3521, lng: 103.8198, category: 'PET_FAIR' },
    { name: 'Bangkok Pet Fair', lat: 13.7563, lng: 100.5018, category: 'PET_FAIR' },
    { name: 'Sydney Pet Fest', lat: -33.8688, lng: 151.2093, category: 'PET_FAIR' },
    { name: 'Toronto Pet Show', lat: 43.6532, lng: -79.3832, category: 'PET_FAIR' },
    { name: 'London Pet Expo', lat: 51.5074, lng: -0.1278, category: 'PET_FAIR' },

    // EDUCATIONAL
    { name: 'Singapore STEM Fair', lat: 1.3521, lng: 103.8198, category: 'EDUCATIONAL' },
    { name: 'Bangkok Education Expo', lat: 13.7563, lng: 100.5018, category: 'EDUCATIONAL' },
    { name: 'Sydney Science Fest', lat: -33.8688, lng: 151.2093, category: 'EDUCATIONAL' },
    { name: 'Toronto Learning Fair', lat: 43.6532, lng: -79.3832, category: 'EDUCATIONAL' },
    { name: 'London Academic Expo', lat: 51.5074, lng: -0.1278, category: 'EDUCATIONAL' },
    { name: 'Dubai Knowledge Summit', lat: 25.2048, lng: 55.2708, category: 'EDUCATIONAL' },

    // OTHERS
    { name: 'Singapore Night Festival', lat: 1.3521, lng: 103.8198, category: 'OTHERS' },
    { name: 'Bangkok Cultural Carnival', lat: 13.7563, lng: 100.5018, category: 'OTHERS' },
    { name: 'Sydney Harbour Fest', lat: -33.8688, lng: 151.2093, category: 'OTHERS' },
    { name: 'Melbourne Arts Festival', lat: -37.8136, lng: 144.9631, category: 'OTHERS' },
    { name: 'Toronto Multicultural Fest', lat: 43.6532, lng: -79.3832, category: 'OTHERS' },
    { name: 'London Street Festival', lat: 51.5074, lng: -0.1278, category: 'OTHERS' },
    { name: 'Dubai Entertainment Expo', lat: 25.2048, lng: 55.2708, category: 'OTHERS' },
  ];

  console.log('Seeding recent events...');

  for (const loc of recentLocations) {
    const slug = loc.name.toLowerCase().replace(/ /g, '-');

    const existingEvent = await prisma.events.findFirst({
      where: { slug: slug }
    });

    if (!existingEvent) {
      // Recent dates: start dates spread across the next 2-3 months (0-90 days)
      const startDate = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (Math.random() * 3 + 1) * 24 * 60 * 60 * 1000);

      await prisma.events.create({
        data: {
          title: loc.name,
          description: `Experience the best of ${loc.name}! Join us for a unique gathering of vendors and visitors.`,
          address: `Central District, ${loc.name.split(' ')[0]}`,
          category: loc.category as any,
          currency_code: 'USD',
          host_id: host2.id,
          latitude: loc.lat,
          longitude: loc.lng,
          status: 'PUBLISHED',
          slug: slug,
          start_date: startDate,
          end_date: endDate,
          booths: { 
            create: Array.from({ length: Math.floor(Math.random() * 16) + 5 }).map((_, i) => ({ 
              name: `Booth ${String.fromCharCode(65 + i)}${i + 1}`, 
              type: 'AVAILABLE',
              x: i * 110, 
              y: 0,
              width: 100,
              height: 100,
              rotation: 0, 
              price: parseFloat((Math.random() * 250 + 25).toFixed(2)), 
              description: `A prime spot at ${loc.name}`
            }
            )),
          },
        },
      });
    }
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });