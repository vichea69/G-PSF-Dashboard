import axios from 'axios';
import http from 'http';
import https from 'https';
const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 100 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 100 }),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});
