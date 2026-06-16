import React from 'react';

export const CountrySkeleton = () => {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
            <div className="h-4 bg-gray-800 rounded w-24"></div>
            <div className="h-3 bg-gray-800 rounded w-16"></div>
        </div>
    );
};

export const ChannelSkeleton = () => {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-800 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
        </div>
    );
};