import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;
console.log('[Axios] baseURL =', baseURL); // will print in browser console

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});
