import { Branch, Product } from '../types';

export const BRANCHES: Branch[] = [
  {
    id: 'kericho',
    name: 'K-Matt Kericho Main Branch',
    town: 'Kericho Town',
    county: 'Kericho',
    address: 'Temple Road, Kericho CBD',
    phone: '+254 712 345 678',
    isMain: true,
    lat: -0.3689,
    lng: 35.2863,
  },
  {
    id: 'nakuru',
    name: 'K-Matt Nakuru Branch',
    town: 'Nakuru CBD',
    county: 'Nakuru',
    address: 'Kenyatta Avenue, Next to Post Office',
    phone: '+254 723 456 789',
    lat: -0.2833,
    lng: 36.0667,
  },
  {
    id: 'eldoret',
    name: 'K-Matt Eldoret Branch',
    town: 'Eldoret',
    county: 'Uasin Gishu',
    address: 'Uganda Road, Zion Mall Annex',
    phone: '+254 734 567 890',
    lat: 0.5143,
    lng: 35.2698,
  },
  {
    id: 'kisumu',
    name: 'K-Matt Kisumu Branch',
    town: 'Kisumu',
    county: 'Kisumu',
    address: 'Oginga Odinga Street, Swan Centre',
    phone: '+254 745 678 901',
    lat: -0.1022,
    lng: 34.7617,
  },
  {
    id: 'bomet',
    name: 'K-Matt Bomet Branch',
    town: 'Bomet Town',
    county: 'Bomet',
    address: 'Bomet High Street, Opposite Stadium',
    phone: '+254 756 789 012',
    lat: -0.7833,
    lng: 35.3333,
  },
  {
    id: 'nairobi',
    name: 'K-Matt Nairobi Flagship',
    town: 'Nairobi',
    county: 'Nairobi',
    address: 'Koinange Street / Westlands Link',
    phone: '+254 700 000 000',
    lat: -1.2864,
    lng: 36.8172,
  },
];

export const DEFAULT_BRANCH_ID = 'kericho';

// Database of Kenya Towns/Counties with approximate coordinates for distance calculation
const KENYA_LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  // Kericho & environs
  'kericho': { lat: -0.3689, lng: 35.2863 },
  'litein': { lat: -0.5833, lng: 35.1833 },
  'kipkelion': { lat: -0.2167, lng: 35.4667 },
  'londiani': { lat: -0.1667, lng: 35.6000 },
  'kapsoit': { lat: -0.3500, lng: 35.2333 },
  'sosiot': { lat: -0.4500, lng: 35.2167 },

  // Nakuru & environs
  'nakuru': { lat: -0.2833, lng: 36.0667 },
  'naivasha': { lat: -0.7167, lng: 36.4333 },
  'gilgil': { lat: -0.4833, lng: 36.2833 },
  'molo': { lat: -0.2500, lng: 35.7333 },
  'njoro': { lat: -0.3333, lng: 35.9333 },
  'bahati': { lat: -0.1500, lng: 36.1500 },

  // Eldoret & environs
  'eldoret': { lat: 0.5143, lng: 35.2698 },
  'uasin gishu': { lat: 0.5143, lng: 35.2698 },
  'iten': { lat: 0.6711, lng: 35.5083 },
  'kapsabet': { lat: 0.2000, lng: 35.1000 },
  'nandi': { lat: 0.2000, lng: 35.1000 },
  'kitale': { lat: 1.0167, lng: 35.0000 },

  // Kisumu & environs
  'kisumu': { lat: -0.1022, lng: 34.7617 },
  'maseno': { lat: -0.0050, lng: 34.6022 },
  'ahero': { lat: -0.1742, lng: 34.9197 },
  'kakamega': { lat: 0.2833, lng: 34.7500 },
  'siaya': { lat: 0.0607, lng: 34.2881 },
  'homabay': { lat: -0.5272, lng: 34.4571 },

  // Bomet & environs
  'bomet': { lat: -0.7833, lng: 35.3333 },
  'sotik': { lat: -0.6833, lng: 35.1167 },
  'longisa': { lat: -0.8833, lng: 35.4167 },
  'narok': { lat: -1.0833, lng: 35.8667 },
  'kilgoris': { lat: -1.0000, lng: 34.8833 },

  // Nairobi & environs
  'nairobi': { lat: -1.2864, lng: 36.8172 },
  'kiambu': { lat: -1.1714, lng: 36.8356 },
  'thika': { lat: -1.0333, lng: 37.0667 },
  'machakos': { lat: -1.5167, lng: 37.2667 },
  'kajiado': { lat: -1.8500, lng: 36.7833 },
  'ruiru': { lat: -1.1500, lng: 36.9667 },
  'ngong': { lat: -1.3667, lng: 36.6500 },
};

/**
 * Calculates straight line distance between two lat/lng points in kilometers.
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Parses user address, city, or county string to determine approximate coordinates.
 */
export function getLocationCoords(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.toLowerCase().trim();

  // Direct match in dictionary
  for (const [key, coords] of Object.entries(KENYA_LOCATION_COORDS)) {
    if (clean.includes(key)) {
      return coords;
    }
  }

  // Fallback to searching branch names/counties in input
  for (const b of BRANCHES) {
    if (clean.includes(b.town.toLowerCase()) || clean.includes(b.county.toLowerCase()) || clean.includes(b.id)) {
      return { lat: b.lat!, lng: b.lng! };
    }
  }

  return null;
}

/**
 * Calculates the exact distance in KM between a user location (address, city, county) and a specific branch.
 */
export function getDistanceToBranchKm(
  locationInput: { address?: string; city?: string; county?: string } | string,
  branchId: string
): number {
  const branch = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];
  if (!branch.lat || !branch.lng) return 1.5;

  let rawString = '';
  if (typeof locationInput === 'string') {
    rawString = locationInput;
  } else if (locationInput) {
    rawString = `${locationInput.address || ''} ${locationInput.city || ''} ${locationInput.county || ''}`;
  }

  const coords = getLocationCoords(rawString);
  if (!coords) {
    // If address contains exact town name match, return short distance
    const lower = rawString.toLowerCase();
    if (lower.includes(branch.town.toLowerCase()) || lower.includes(branch.county.toLowerCase()) || lower.includes(branch.id)) {
      return 1.8;
    }
    return 12.5; // Default fallback distance in km
  }

  const dist = calculateHaversineDistanceKm(coords.lat, coords.lng, branch.lat, branch.lng);
  return dist < 0.5 ? 0.8 : dist;
}

/**
 * Finds the nearest K-Matt Supermarket Branch based on a customer's profile address/county.
 */
export function getNearestBranchForCustomer(
  locationInput: { address?: string; city?: string; county?: string } | string
): { branch: Branch; distanceKm: number } {
  let rawString = '';
  if (typeof locationInput === 'string') {
    rawString = locationInput;
  } else if (locationInput) {
    rawString = `${locationInput.address || ''} ${locationInput.city || ''} ${locationInput.county || ''}`;
  }

  const coords = getLocationCoords(rawString);

  if (!coords) {
    // String matching fallback
    const lower = rawString.toLowerCase();
    for (const b of BRANCHES) {
      if (lower.includes(b.town.toLowerCase()) || lower.includes(b.county.toLowerCase()) || lower.includes(b.id)) {
        return { branch: b, distanceKm: 1.8 };
      }
    }
    // Default to Kericho main branch if completely unmapped
    return { branch: BRANCHES[0], distanceKm: 2.5 };
  }

  let closestBranch = BRANCHES[0];
  let minDistance = Infinity;

  for (const b of BRANCHES) {
    if (b.lat && b.lng) {
      const d = calculateHaversineDistanceKm(coords.lat, coords.lng, b.lat, b.lng);
      if (d < minDistance) {
        minDistance = d;
        closestBranch = b;
      }
    }
  }

  return {
    branch: closestBranch,
    distanceKm: minDistance < 0.5 ? 0.8 : minDistance,
  };
}

/**
 * Gets stock quantity for a product at a specific branch.
 * Falls back deterministically if branchStock map isn't explicitly defined.
 */
export function getProductStockForBranch(product: Product, branchId: string): number {
  if (product.branchStock && typeof product.branchStock[branchId] === 'number') {
    return product.branchStock[branchId];
  }

  // Deterministic seed formula based on product.id and branchId string
  const baseStock = product.stock ?? 10;
  if (baseStock <= 0) return 0;

  let hash = 0;
  for (let i = 0; i < branchId.length; i++) {
    hash = (hash << 5) - hash + branchId.charCodeAt(i);
    hash |= 0;
  }
  const varianceFactor = Math.abs((product.id * 31 + hash) % 100) / 100; // 0.0 to 0.99

  // Kericho (main branch) gets near full stock
  if (branchId === 'kericho') {
    return Math.max(0, Math.round(baseStock * (0.8 + varianceFactor * 0.4)));
  }

  // Nakuru & Eldoret get ~50% - 110%
  if (branchId === 'nakuru' || branchId === 'eldoret') {
    return Math.max(0, Math.round(baseStock * (0.4 + varianceFactor * 0.7)));
  }

  // Other branches get varied stock (some items might be low stock or 0)
  const calculated = Math.round(baseStock * (0.2 + varianceFactor * 0.8));
  return Math.max(0, calculated);
}

/**
 * Returns branches that have this item in stock, excluding current branch
 */
export function getOtherBranchesWithStock(product: Product, currentBranchId: string): Array<{ branch: Branch; stock: number }> {
  return BRANCHES
    .filter(b => b.id !== currentBranchId)
    .map(branch => ({
      branch,
      stock: getProductStockForBranch(product, branch.id),
    }))
    .filter(item => item.stock > 0);
}
