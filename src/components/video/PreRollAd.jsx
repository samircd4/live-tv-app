import React, { useState, useEffect } from 'react';
import { tvService } from '../../api/tvService';

export const PreRollAd = ({ onClose, skipDelaySeconds, totalDurationSeconds }) => {
    // Use env vars as defaults
    const defaultSkipDelay = parseInt(import.meta.env.VITE_PREROLL_AD_SKIP_DELAY_SECONDS) || 10;
    const defaultTotalDuration = parseInt(import.meta.env.VITE_PREROLL_AD_TOTAL_DURATION_SECONDS) || 30;
    const finalSkipDelay = skipDelaySeconds ?? defaultSkipDelay;
    const finalTotalDuration = totalDurationSeconds ?? defaultTotalDuration;
    const [product, setProduct] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(finalTotalDuration);
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
    const canSkip = secondsWatched >= finalSkipDelay;

    return (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-1 sm:p-6">

            {/* Skip / countdown button — always at top right, above modal */}
            <div className="absolute top-2 right-2 z-[60]">
                {canSkip ? (
                    <button
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-black px-4 py-2 rounded-full border border-red-500/50 transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                        Skip Ad ➔
                    </button>
                ) : (
                    <div className="bg-black/80 text-gray-400 text-xs font-bold px-3 py-2 rounded-full border border-gray-700/80">
                        Skip in <span className="text-yellow-400 font-mono font-black">{finalSkipDelay - secondsWatched}s</span>
                    </div>
                )}
            </div>

            {/* Ad Card — mobile: vertical stack, desktop: horizontal */}
            <div className="w-full max-w-2xl bg-gray-950 border border-yellow-500/30 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-fade-in select-text max-h-[85vh] sm:max-h-[90vh]">

                {/* Product Image */}
                <div className="w-full sm:w-2/5 h-20 sm:h-auto relative bg-gray-900 flex items-center justify-center overflow-hidden shrink-0">
                    {product.image || product.thumbnail || product.images?.[0]?.image ? (
                        <img
                            src={product.image || product.thumbnail || product.images[0].image}
                            alt={product.name}
                            className="w-full h-full object-cover opacity-90"
                        />
                    ) : (
                        <span className="text-4xl">🎁</span>
                    )}
                    {/* Countdown overlay on image */}
                    <div className="absolute bottom-2 left-2">
                        <div className="bg-black/70 border border-gray-700 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-300">
                            Ad ends in <span className="text-yellow-400 font-mono">{secondsLeft}s</span>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-between p-3 sm:p-6 flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <span className="self-start text-[9px] font-extrabold uppercase bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30 tracking-widest animate-pulse">
                            Sponsored
                        </span>
                        <h2 className="text-sm sm:text-xl font-black text-white leading-tight line-clamp-2">
                            {product.name}
                        </h2>
                        <p className="text-gray-400 text-[10px] sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed">
                            {product.short_description
                                ? product.short_description.replace(/<[^>]*>/g, '')
                                : "Exclusive premium deal from Sarker Shop! Top quality gadgets at unmatched pricing."}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-gray-400 font-semibold border-t border-gray-800 pt-2">
                            {product.brand?.name && (
                                <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[10px]">
                                    Brand: <strong className="text-white">{product.brand.name}</strong>
                                </span>
                            )}
                            <div className="flex items-center gap-1 ml-auto select-none">
                                <span className="text-yellow-400 text-sm">
                                    {"★".repeat(Math.round(parseFloat(product.rating) || 0))}
                                    {"☆".repeat(5 - Math.round(parseFloat(product.rating) || 0))}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold">({product.reviews_count ?? 0})</span>
                            </div>
                        </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between border-t border-gray-800 pt-2 mt-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Price</span>
                            <span className="text-sm sm:text-2xl font-black text-yellow-500">
                                {product.price ? `${product.price} BDT` : 'Check Store'}
                            </span>
                        </div>
                        <a
                            href={productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[10px] tracking-wider px-3 py-2 rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer active:scale-95 shrink-0"
                        >
                            Shop Deal ⚡
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
