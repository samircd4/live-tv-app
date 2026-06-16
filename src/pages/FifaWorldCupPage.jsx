import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

const DUMMY_FIFA_CHANNELS = [
    { 
        id: 'fifa-wc-1', 
        name: 'FIFA World Cup Live Feed 1 (4K)', 
        category: 'Live Broadcast', 
        stream_url: 'https://sarker.shop/api/live-tv/bioscope-stream/', 
        logo: '' 
    },
    { 
        id: 'fifa-wc-2', 
        name: 'FIFA World Cup Live Feed 2 (Multi-Angle)', 
        category: 'Live Broadcast', 
        stream_url: 'https://sarker.shop/api/live-tv/bioscope-stream/', 
        logo: '' 
    },
    { 
        id: 'fifa-wc-highlights', 
        name: 'World Cup Highlights & Studio 24/7', 
        category: 'Studio Show', 
        stream_url: 'https://sarker.shop/api/live-tv/bioscope-stream/', 
        logo: '' 
    },
    { 
        id: 'fifa-wc-classics', 
        name: 'Historic WC Classic Matches', 
        category: 'Classic Archives', 
        stream_url: 'https://test-streams.mux.dev/x36xhq/x36xhq.m3u8', 
        logo: '' 
    }
];

export const FifaWorldCupPage = () => {
    const navigate = useNavigate();

    const handleChannelClick = (channel) => {
        navigate(`/watch/${channel.id}`, { 
            state: { 
                channel, 
                countrySlug: 'fifa' 
            } 
        });
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-yellow-600 via-amber-700 to-orange-800 rounded-3xl p-8 sm:p-12 mb-12 shadow-2xl border border-yellow-500/20 text-center sm:text-left">
                    <div className="absolute top-0 right-0 w-[40%] h-full bg-radial-gradient from-yellow-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 max-w-xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider rounded-full mb-4 animate-bounce">
                            🏆 World Cup Zone
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
                            FIFA WORLD CUP
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
                            Watch all matches live, check out multi-angle player cams, and catch up with highlights and analysis 24/7.
                        </p>
                    </div>
                </div>

                {/* Section Title */}
                <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Live Broadcast Channels
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Select a channel to begin instant premium live streaming.
                    </p>
                </div>

                {/* Channels Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {DUMMY_FIFA_CHANNELS.map((channel) => (
                        <div
                            key={channel.id}
                            onClick={() => handleChannelClick(channel)}
                            className="group bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/80 hover:border-yellow-500/30 rounded-2xl p-4 flex items-center space-x-4 cursor-pointer transition-all duration-200 shadow-sm"
                        >
                            {/* Channel Logo */}
                            <div className="w-12 h-12 bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 shrink-0 relative group-hover:border-yellow-500/20 transition-all">
                                <span className="text-xl group-hover:scale-110 transition-transform">⚽</span>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-100 group-hover:text-yellow-400 transition-colors truncate">
                                    {channel.name}
                                </h4>
                                <span className="inline-block mt-1 text-[10px] bg-gray-950 text-yellow-500 border border-yellow-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                    {channel.category}
                                </span>
                            </div>

                            {/* Play Indicator */}
                            <div className="text-gray-600 group-hover:text-yellow-400 transition-colors text-sm font-bold pl-2 select-none">
                                ▶
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};
export default FifaWorldCupPage;
