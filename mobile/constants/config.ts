import { Platform } from 'react-native';

// ANDROID EMULATOR needs 10.0.2.2 to reach host localhost
// PHYSICAL DEVICE needs your LAN IP (e.g., 192.168.x.x)
// IOS SIMULATOR (Mac only) uses localhost
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = `http://${HOST}:5000`;
