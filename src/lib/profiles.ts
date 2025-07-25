// src/lib/profiles.ts

export interface Profile {
  name: string;
  logoUrl: string;
  address: string;
  email: string;
  phone: string;
  portfolio: string;
  paymentDetails: string;
}

const profiles: Record<string, Profile> = {
  oliverrevelo: { // Key matches the URL slug
    name: 'Oliver Revelo',
    logoUrl: '/oliver-logo.png',
    address: 'Rizal, Philippines',
    email: 'oancholarevelo@gmail.com',
    phone: '+63 947 533 7630',
    portfolio: 'oliverrevelo.vercel.app',
    paymentDetails: 'Bank Transfer:\nBPI: 1234-5678-90\n\nGCash:\n09475337630 (Oliver R.)'
  },
  lanceflores: { // Key matches the URL slug
    name: 'Lance Flores',
    logoUrl: '/lance-logo.png',
    address: 'Quezon City, Philippines',
    email: 'hello.lanceflores@gmail.com',
    phone: '+63 916 287 0007',
    portfolio: 'lanceflores.netlify.app',
    paymentDetails: 'Bank Transfer:\nBDO: 0987-6543-21\n\nGCash:\n09162870007 (Lance F.)'
  },
};

// Blank profile for the custom user path
export const blankProfile: Profile = {
  name: '',
  logoUrl: '', // An empty logoUrl will prevent a broken image
  address: '',
  email: '',
  phone: '',
  portfolio: '',
  paymentDetails: ''
};


// Simulate an API call to get all profiles
export const getProfiles = (): Promise<Record<string, Profile>> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(profiles);
    }, 500); // Simulate network delay
  });
};

// Simulate an API call to get a single profile, now with custom option
export const getProfile = (key: string): Promise<Profile | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (key === 'custom') {
        resolve(blankProfile);
      } else {
        resolve(profiles[key]);
      }
    }, 500); // Simulate network delay
  });
};