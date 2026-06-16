import React from 'react';

export const CountryCard = ({ country, onClick }) => {
    // Generate a consistent dummy channel count based on country id
    const dummyChannelCount = ((country.id || 0) % 15) + 8;

    return (
        <div
            onClick={onClick}
            className="group bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/80 hover:border-yellow-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-yellow-500/5 select-none"
        >
            {/* Country Flag Container */}
            <div className="w-16 h-16 bg-gray-950 group-hover:bg-gray-900/50 border border-gray-850 group-hover:border-yellow-500/20 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner transition-all duration-300">
                {country.flag_icon || '🌐'}
            </div>
            
            {/* Country Name */}
            <h3 className="text-base font-bold text-gray-100 group-hover:text-yellow-400 transition-colors duration-300">
                {country.name}
            </h3>
            
            {/* Channels Count Badge */}
            <span className="mt-2.5 px-2.5 py-0.5 bg-yellow-500/10 group-hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/10 text-[10px] font-bold tracking-wider uppercase rounded-full transition-all duration-300">
                {dummyChannelCount} Channels
            </span>
        </div>
    );
};
