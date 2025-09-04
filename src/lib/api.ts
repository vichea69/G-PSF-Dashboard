import axios from 'axios';
const baseURL = process.env.NEXT_PUBLIC_API_URL;

// Note: Don't set a global Content-Type header so that
// Axios can automatically set the correct boundary for
// multipart/form-data when sending FormData.
export const api = axios.create({
  baseURL,
  withCredentials: true
});
