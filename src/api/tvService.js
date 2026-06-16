import { axiosInstance } from './axiosInstance';

let totalPages = null;
let isFirstCall = true;

export const tvService = {
  getCountries: async () => {
    const response = await axiosInstance.get('/live-tv/countries/');
    return response.data;
  },

  getChannels: async (countrySlug = null) => {
    let url = '/live-tv/channels/';
    if (countrySlug) {
      url += `?country_slug=${countrySlug}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getRandomProductAd: async () => {
    let page = 1;
    if (!isFirstCall && totalPages && totalPages > 1) {
      page = Math.floor(Math.random() * totalPages) + 1;
    }

    try {
      const response = await axiosInstance.get(`/products/?page=${page}`);
      const data = response.data;

      if (data && typeof data.count === 'number') {
        totalPages = Math.ceil(data.count / 20);
      }

      isFirstCall = false;

      const products = data.results || data;
      if (products && products.length > 0) {
        const randomIndex = Math.floor(Math.random() * products.length);
        return products[randomIndex];
      }
    } catch (err) {
      console.error(`Failed to fetch product ad page ${page}:`, err);
      // Fallback to page 1 if a random page fails (e.g. page doesn't exist)
      if (page !== 1) {
        try {
          const fallback = await axiosInstance.get('/products/?page=1');
          const data = fallback.data;
          const products = data.results || data;
          if (products && products.length > 0) {
            const randomIndex = Math.floor(Math.random() * products.length);
            return products[randomIndex];
          }
        } catch (fbErr) {
          console.error("Fallback product ad fetch failed:", fbErr);
        }
      }
    }
    return null;
  }
};