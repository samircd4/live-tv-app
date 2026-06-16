import React, { useEffect, useState, useRef } from 'react';
import { tvService } from '../../api/tvService';

export const ProductAd = ({ onClose }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false); // Controls opacity/slide state
    const slideTimerRef = useRef(null);

    const fetchNextAd = async () => {
        setIsVisible(false); // Slide out

        setTimeout(async () => {
            try {
                const data = await tvService.getRandomProductAd();
                if (data) {
                    setProduct(data);
                    setIsVisible(true); // Slide back in
                }
            } catch (err) {
                console.error("Failed to rotate ad:", err);
            }
        }, 500);
    };

    useEffect(() => {
        const initAd = async () => {
            try {
                const data = await tvService.getRandomProductAd();
                setProduct(data);
                setTimeout(() => setIsVisible(true), 100);
            } catch (err) {
                console.error("Initial ad fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        initAd();
    }, []);

    useEffect(() => {
        if (loading || !product) return;

        slideTimerRef.current = setInterval(() => {
            fetchNextAd();
        }, 5000);

        return () => {
            if (slideTimerRef.current) clearInterval(slideTimerRef.current);
        };
    }, [loading, product]);

    if (loading || !product) return null;

    const productUrl = product.slug ? `https://sarker.shop/products/${product.slug}` : `https://sarker.shop`;

    const handleDismiss = () => {
        setIsVisible(false);
        if (slideTimerRef.current) clearInterval(slideTimerRef.current);
        setTimeout(() => onClose(), 500);
    };

    return (
        <div
            // Changed from bottom-24 to bottom-40 to increase the gap from the ticker
            className={`absolute bottom-48 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] max-w-2xl bg-gray-950/95 backdrop-blur-md text-white p-4 rounded-2xl border border-yellow-500/40 flex items-center justify-between gap-4 z-40 shadow-2xl transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
                }`}
        >
            <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-95 cursor-pointer"
            >
                {/* ... rest of the component remains the same ... */}
                <div className="w-16 h-16 bg-gray-900 rounded-xl overflow-hidden shrink-0 border border-gray-800 flex items-center justify-center shadow-inner">
                    {product.image || product.thumbnail || product.images?.[0]?.image ? (
                        <img
                            src={product.image || product.thumbnail || product.images[0].image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-2xl">🎁</span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        SARKER SHOP FLASH DEAL
                    </span>
                    <p className="text-base font-bold text-gray-100 truncate mt-1">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-yellow-450 font-extrabold select-none">
                            Price: {product.price ? `${product.price} BDT` : 'Check Store'}
                        </span>
                        <span className="text-gray-700 font-bold select-none">•</span>
                        <div className="flex items-center gap-1 select-none">
                            <span className="text-yellow-400 text-lg">
                                {"★".repeat(Math.round(parseFloat(product.rating) || 0))}
                                {"☆".repeat(5 - Math.round(parseFloat(product.rating) || 0))}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">({product.reviews_count ?? 0})</span>
                        </div>
                    </div>
                </div>
            </a>

            <div className="flex items-center gap-3 shrink-0">
                <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black px-4 py-2 rounded-xl transition-colors hidden sm:inline-block shadow-md cursor-pointer"
                >
                    Buy Now
                </a>
                <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-gray-800 text-sm font-bold cursor-pointer"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};