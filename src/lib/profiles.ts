// src/lib/profiles.ts

export interface Profile {
  name: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
}

export const profiles: Record<string, Profile> = {
  oliverrevelo: { // Key matches the URL slug
    name: 'Oliver Revelo',
    logoUrl: '/oliver-logo.png',
    address: 'Rizal, Philippines',
    email: 'oancholarevelo@gmail.com',
    phone: '+63 947 533 7630',
  },
  lanceflores: { // Key matches the URL slug
    name: 'Lance Flores',
    logoUrl: '/lance-logo.png',
    address: 'Quezon City, Philippines',
    email: 'hello.lanceflores@gmail.com',
    phone: '+63 916 287 0007',
  },
};