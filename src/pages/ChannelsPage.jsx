import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { tvService } from '../api/tvService';
import { ChannelSkeleton } from '../components/ui/Skeleton';
import { Layout } from '../components/layout/Layout';

export const ChannelsPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countryDetails, setCountryDetails] = useState(location.state?.country || null);

    useEffect(() => {
        const fetchChannelsData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await tvService.getChannels(slug);

                if (Array.isArray(data)) {
                    setChannels(data);
                } else if (data && Array.isArray(data.results)) {
                    setChannels(data.results);
                } else {
                    console.error("Unexpected channel payload format:", data);
                    setChannels([]);
                }

            } catch (err) {
                console.error("Failed to load channels:", err);
                setError("Unable to load channels for this territory. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        const fetchCountryDetails = async () => {
            if (!countryDetails) {
                try {
                    const countriesList = await tvService.getCountries();
                    const list = Array.isArray(countriesList) ? countriesList : (countriesList?.results || []);
                    const matched = list.find(c => c.slug === slug);
                    if (matched) {
                        setCountryDetails(matched);
                    }
                } catch (err) {
                    console.error("Failed to load country details:", err);
                }
            }
        };

        if (slug) {
            fetchChannelsData();
            fetchCountryDetails();
        }
    }, [slug, countryDetails]);

    return (
        <Layout>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                {/* Back to Zones link placed in page content */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors group cursor-pointer">
                        <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Back to Zones
                    </Link>
                </div>

                {/* Country Flag Card Banner */}
                <div className="mb-8 flex items-center gap-4 bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 sm:p-8">
                    <div className="w-16 h-16 bg-gray-950 border border-gray-850 rounded-full flex items-center justify-center text-4xl shadow-inner select-none shrink-0">
                        {countryDetails?.flag_icon || '🌐'}
                    </div>
                    <div>
                        <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">
                            Territory: {slug?.replace('-', ' ')}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                            Available Broadcast Channels
                        </h1>
                    </div>
                </div>


                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-center text-red-400 max-w-md mx-auto my-6">
                        {error}
                    </div>
                )}

                {!loading && channels.length === 0 && !error && (
                    <div className="bg-gray-900/60 border border-gray-800 p-12 rounded-2xl text-center max-w-md mx-auto my-12">
                        <span className="text-4xl">📺</span>
                        <h3 className="text-lg font-bold mt-4 text-gray-200">No Channels Found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            There are currently no active live stations configured for this country zone.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, idx) => <ChannelSkeleton key={idx} />)
                    ) : (
                        channels.map((channel) => (
                            <div
                                key={channel.id}
                                onClick={() => navigate(`/watch/${channel.id}`, { state: { channel, countrySlug: slug } })}
                                className="group bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/85 hover:border-yellow-500/30 rounded-xl p-4 flex items-center space-x-4 cursor-pointer transition-all duration-200 shadow-sm"
                            >
                                <div className="w-12 h-12 bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center border border-gray-800 shrink-0 relative group-hover:border-gray-750 transition-colors">
                                    {channel.logo ? (
                                        <img
                                            src={channel.logo}
                                            alt={channel.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => { e.target.src = ''; e.target.placeholder = '📺' }}
                                        />
                                    ) : (
                                        <span className="text-lg">📺</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-100 group-hover:text-yellow-400 transition-colors truncate">
                                        {channel.name}
                                    </h4>
                                    <span className="inline-block mt-0.5 text-[11px] bg-gray-950 text-gray-400 px-1.5 py-0.5 rounded font-medium border border-gray-800/40">
                                        {channel.category || 'General'}
                                    </span>
                                </div>

                                <div className="text-gray-600 group-hover:text-yellow-400 transition-colors text-sm font-bold pl-2 cursor-pointer select-none">
                                    ▶
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </Layout>
    );
};