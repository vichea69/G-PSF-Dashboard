//connect to nest js API
import axios from 'axios';
const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true
});

//using fetch build in function
export const baseAPI = process.env.NEXT_PUBLIC_API_URL;
