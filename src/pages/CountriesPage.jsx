import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tvService } from '../api/tvService';
import { CountrySkeleton } from '../components/ui/Skeleton';
import { Layout } from '../components/layout/Layout';
import { CountryCard } from '../components/home/CountryCard';

export const CountriesPage = () => {
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCountriesData = async () => {
            try {
                setLoading(true);
                const data = await tvService.getCountries();

                if (Array.isArray(data)) {
                    setCountries(data);
                } else if (data && Array.isArray(data.results)) {
                    setCountries(data.results);
                } else {
                    console.error("Unexpected data structure:", data);
                    setCountries([]);
                }

            } catch (err) {
                console.error("Failed to fetch countries:", err);
                setError("Could not load streaming zones. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCountriesData();
    }, []);

    return (
        <Layout>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-center text-red-400 max-w-md mx-auto my-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, idx) => <CountrySkeleton key={idx} />)
                    ) : (
                        countries.map((country) => (
                            <CountryCard
                                key={country.id}
                                country={country}
                                onClick={() => navigate(`/country/${country.slug}`, { state: { country } })}
                            />
                        ))
                    )}
                </div>
            </main>
        </Layout>
    );
};