import React, { useState, useEffect } from 'react';
import { tvService } from '../../api/tvService';

export const PreRollAd = ({ onClose, skipDelaySeconds = 10, totalDurationSeconds = 30 }) => {
    const [product, setProduct] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(totalDurationSeconds);
    const [secondsWatched, setSecondsWatched] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const data = await tvService.getRandomProductAd();
                setProduct(data);
            } catch (err) {
                console.error("Failed to load pre-roll ad:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAd();
    }, []);

    useEffect(() => {
        if (loading || !product) return;

        // Countdown timer
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
            setSecondsWatched(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, product]);

    if (loading || !product) return null;

    const productUrl = product.slug ? `https://sarker.shop/products/${product.slug}` : `https://sarker.shop`;
    const canSkip = secondsWatched >= skipDelaySeconds;

    return (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="w-[80%] h-[80%] max-w-4xl bg-gray-950 border border-yellow-500/30 rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in select-text">
                
                {/* Visual Image & CTA Overlay */}
                <div className="w-full md:w-1/2 h-48 md:h-full relative bg-gray-900 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-gray-850">
                    {product.image || product.thumbnail || product.images?.[0]?.image ? (
                        <img 
                            src={product.image || product.thumbnail || product.images[0].image} 
                            alt={product.name} 
                            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                        />
                    ) : (
                        <span className="text-6xl">🎁</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end p-6">
                        <div className="bg-black/60 border border-gray-850 rounded-full px-4 py-2.5 text-xs font-bold text-gray-300 backdrop-blur-sm shadow-lg">
                            Ad ends in <span className="text-yellow-400 font-mono text-sm">{secondsLeft}s</span>
                        </div>
                    </div>
                </div>

                {/* Details & Counter Section */}
                <div className="w-full md:w-1/2 flex flex-col justify-between p-8 text-left bg-gradient-to-b from-gray-950 to-neutral-900">
                    <div className="flex flex-col gap-4">
                        <span className="self-start text-[10px] font-extrabold uppercase bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 tracking-widest animate-pulse">
                            Sponsored Promotion
                        </span>
                        <h2 className="text-xl md:text-2xl font-black text-white leading-tight line-clamp-2">
                            {product.name}
                        </h2>
                        <p className="text-gray-400 text-sm line-clamp-3 md:line-clamp-4 leading-relaxed">
                            {product.short_description ? product.short_description.replace(/<[^>]*>/g, '') : "Check out this exclusive premium deal from Sarker Shop! Get top quality gadgets and accessories at unmatched pricing."}
                        </p>

                        {/* Meta Specs: Brand, Stock, Rating, and Review Counts */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-semibold border-t border-gray-900 pt-3">
                            {product.brand?.name && (
                                <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[11px]">
                                    Brand: <strong className="text-white">{product.brand.name}</strong>
                                </span>
                            )}
                            {product.stock_quantity !== undefined && (
                                <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-[11px]">
                                    Stock: <strong className="text-white">{product.stock_quantity} available</strong>
                                </span>
                            )}
                            <div className="flex items-center gap-1 ml-auto select-none">
                                <span className="text-yellow-400 text-lg">
                                    {"★".repeat(Math.round(parseFloat(product.rating) || 0))}
                                    {"☆".repeat(5 - Math.round(parseFloat(product.rating) || 0))}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold">({product.reviews_count ?? 0})</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-800 pt-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Price</span>
                            <span className="text-2xl font-black text-yellow-500">
                                {product.price ? `${product.price} BDT` : 'Check Store'}
                            </span>
                        </div>
                        
                        {/* Shop Deal CTA Button */}
                        <a 
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-transform transform hover:scale-105 cursor-pointer"
                        >
                            Shop Deal ⚡
                        </a>
                    </div>
                </div>

                {/* Skip / Locked Skip Indicator */}
                <div className="absolute top-4 right-4">
                    {canSkip ? (
                        <button 
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white hover:text-yellow-400 text-xs font-black px-5 py-2.5 rounded-full backdrop-blur-md border border-white/25 transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                            Skip Ad ➔
                        </button>
                    ) : (
                        <div className="bg-black/60 text-gray-400 text-xs font-bold px-4 py-2.5 rounded-full backdrop-blur-md border border-gray-800/80">
                            Skip in <span className="text-yellow-400 font-mono font-black">{skipDelaySeconds - secondsWatched}s</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
