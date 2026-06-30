import { axiosInstance } from './axiosInstance';

let totalPages = null;
let isFirstCall = true;

export const tvService = {
    getCountries: async () => {
        const response = await axiosInstance.get('/live-tv/countries/');
        return response.data;
    },

    getChannels: async (countrySlug = null, page = 1, category = '') => {
        let url = '/live-tv/channels/';
        const params = new URLSearchParams();

        if (countrySlug) {
            params.append('country_slug', countrySlug);
        }
        params.append('page', page.toString());

        // Append category ID to query params if a specific category is selected
        if (category && category !== 'all') {
            params.append('category', category);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
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