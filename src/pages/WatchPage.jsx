import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { tvService } from '../api/tvService';
import { useAuth } from '../context/AuthContext';
import { ProductAd } from '../components/video/ProductAd';
import { NoticeTicker } from '../components/video/NoticeTicker';
import { PreRollAd } from '../components/video/PreRollAd';
import { Layout } from '../components/layout/Layout';


const isYouTubeUrl = (url) => {
    if (!url) return false;
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/|live\/)?([a-zA-Z0-9_-]{11})/.test(url);
};

const getStreamUrl = (url) => {
    if (isYouTubeUrl(url)) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        return `${baseUrl}/live-tv/youtube-resolve?url=${encodeURIComponent(url)}`;
    }
    return url;
};

export const WatchPage = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-400 font-medium tracking-wide">Securing connection...</p>
            </div>
        );
    }

    // Don't render if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return <WatchPageContent />;
};

const WatchPageContent = () => {
    const { channelId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const workspaceRef = useRef(null);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const mouseTimerRef = useRef(null);

    const [currentChannel, setCurrentChannel] = useState(location.state?.channel || null);
    const [sidebarChannels, setSidebarChannels] = useState([]);
    const [totalChannels, setTotalChannels] = useState(0);
    const [allCategories, setAllCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [isFirstAdShow, setIsFirstAdShow] = useState(true);
    const [isPreRollActive, setIsPreRollActive] = useState(true);
    const isPreRollActiveRef = useRef(true);
    const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Start muted for mobile autoplay support
    const [volume, setVolume] = useState(0.5);
    const countrySlug = location.state?.countrySlug || '';
    const [qualities, setQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1);
    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'favs', 'sports'
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favoriteChannels');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const channelListRef = useRef(null);

    useEffect(() => {
        isPreRollActiveRef.current = isPreRollActive;
    }, [isPreRollActive]);

    // Dummy channels data for testing
    const dummyChannels = [
        { id: 1, name: 'Football World Cup 2026 (1)', category: 'Sports', logo: null, stream_url: 'https://example.com/stream1' },
        { id: 2, name: 'Football World Cup 2026 Sky', category: 'Sports', logo: null, stream_url: 'https://example.com/stream2' },
        { id: 3, name: 'Football World Cup 2026 1', category: 'Sports', logo: null, stream_url: 'https://example.com/stream3' },
        { id: 4, name: 'Football World Cup 2026 (2)', category: 'Sports', logo: null, stream_url: 'https://example.com/stream4' },
        { id: 5, name: 'FIFA World Cup 2026 India ...', category: 'Sports', logo: null, stream_url: 'https://example.com/stream5' },
        { id: 6, name: 'Fifa TV', category: 'Sports', logo: null, stream_url: 'https://example.com/stream6' },
        { id: 7, name: 'Tsports HD', category: 'Sports', logo: null, stream_url: 'https://example.com/stream7' },
        { id: 8, name: 'Ptv Sports', category: 'Sports', logo: null, stream_url: 'https://example.com/stream8' },
        { id: 9, name: 'A Sports HD', category: 'Sports', logo: null, stream_url: 'https://example.com/stream9' },
        { id: 10, name: 'A Sports', category: 'Sports', logo: null, stream_url: 'https://example.com/stream10' },
    ];

    const fetchChannels = async (page = 1, append = false) => {
        if (loadingChannels) return;
        setLoadingChannels(true);

        try {
            // Try to fetch from API first
            const data = await tvService.getChannels(countrySlug, page);
            let channelsList = Array.isArray(data) ? data : (data?.results || []);

            // If no channels from API, use dummy data
            if (channelsList.length === 0 && page === 1) {
                channelsList = dummyChannels;
            }

            if (append) {
                setSidebarChannels(prev => [...prev, ...channelsList]);
                // Add new categories from the newly loaded channels
                setAllCategories(prev => {
                    const existingCategories = new Set(prev);
                    channelsList.forEach(chan => {
                        if (chan.category) {
                            existingCategories.add(chan.category);
                        }
                    });
                    return [...existingCategories];
                });
            } else {
                setSidebarChannels(channelsList);
                // Set initial categories from first page
                const initialCategories = new Set();
                channelsList.forEach(chan => {
                    if (chan.category) {
                        initialCategories.add(chan.category);
                    }
                });
                setAllCategories([...initialCategories]);
            }

            // Update total channel count from API
            if (data && typeof data.count === 'number') {
                setTotalChannels(data.count);
            } else if (!append && channelsList.length > 0) {
                setTotalChannels(channelsList.length);
            }

            // Check if there are more pages (check for next link or count)
            if (data && data.next) {
                setHasMorePages(true);
            } else if (data && data.count && sidebarChannels.length + channelsList.length >= data.count) {
                setHasMorePages(false);
            } else {
                setHasMorePages(channelsList.length >= 20); // Assume pagination if 20+ items
            }

            if (!currentChannel && (append ? sidebarChannels : channelsList).length > 0) {
                const allChannels = append ? [...sidebarChannels, ...channelsList] : channelsList;
                const activeMatch = allChannels.find(ch => ch.id.toString() === channelId);
                if (activeMatch) {
                    setCurrentChannel(activeMatch);
                } else {
                    // If no match, set the first channel as current
                    setCurrentChannel(allChannels[0]);
                }
            }
        } catch (err) {
            console.error("Failed to load channels:", err);
            // Fallback to dummy data on error for first page
            if (page === 1) {
                setSidebarChannels(dummyChannels);
                if (!currentChannel) {
                    setCurrentChannel(dummyChannels[0]);
                }
            }
        } finally {
            setLoadingChannels(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        setHasMorePages(true);
        fetchChannels(1, false);
    }, [channelId, countrySlug]);

    // Infinite scroll handler
    const handleScroll = (e) => {
        const container = e.target;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
            if (hasMorePages && !loadingChannels) {
                setCurrentPage(prev => {
                    const nextPage = prev + 1;
                    fetchChannels(nextPage, true);
                    return nextPage;
                });
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'm') {
                toggleMute();
            } else if (key === 'f') {
                toggleCustomFullscreen();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                adjustVolume(0.05);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                adjustVolume(-0.05);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMuted, volume, isPlaying, showSettings]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !currentChannel?.stream_url) return;

        setIsPreRollActive(true);
        isPreRollActiveRef.current = true;
        setShowAd(false);
        setIsFirstAdShow(true);
        setIsPlaying(false);
        setQualities([]);
        setCurrentQuality(-1);
        setShowSettings(false);

        video.volume = volume;
        video.muted = true;
        setIsMuted(true);

        if (hlsRef.current) {
            hlsRef.current.destroy();
        }

        const executeAutoplay = () => {
            if (isPreRollActiveRef.current) return;
            video.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    video.muted = true;
                    setIsMuted(true);
                    video.play()
                        .then(() => setIsPlaying(true))
                        .catch(criticalErr => console.error("Critical stream play failure:", criticalErr));
                });
        };

        if (Hls.isSupported()) {
            const hls = new Hls({ maxMaxBufferLength: 15, enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            hls.loadSource(getStreamUrl(currentChannel.stream_url));
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, executeAutoplay);
            hls.on(Hls.Events.LEVEL_LOADED, () => {
                if (hls.levels && hls.levels.length > 0) {
                    const mapped = hls.levels.map((level, idx) => ({
                        index: idx,
                        height: level.height || 'Custom'
                    })).sort((a, b) => b.height - a.height);
                    setQualities(mapped);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = getStreamUrl(currentChannel.stream_url);
            video.addEventListener('loadedmetadata', executeAutoplay);
        }

        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsCustomFullscreen(isFull);

            if (!isFull && screen.orientation?.unlock) {
                try {
                    screen.orientation.unlock();
                } catch (err) {
                    console.warn('Orientation unlock not supported:', err);
                }
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [currentChannel]);

    // Recurring ad reappear timer
    useEffect(() => {
        if (showAd || isPreRollActive) return;

        let delayMs;
        if (isFirstAdShow) {
            delayMs = 60 * 1000; // 60 seconds first time
        } else {
            const reappearMinutes = parseFloat(import.meta.env.VITE_PRODUCT_AD_REAPPEAR_MINUTES) || 5;
            delayMs = reappearMinutes * 60 * 1000;
        }

        const timer = setTimeout(() => {
            setShowAd(true);
            setIsFirstAdShow(false);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [showAd, isPreRollActive, isFirstAdShow]);

    // Trigger video playback after pre-roll ad finishes
    useEffect(() => {
        if (!isPreRollActive && videoRef.current && currentChannel?.stream_url) {
            const video = videoRef.current;
            video.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                    video.muted = true;
                    setIsMuted(true);
                    video.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => console.error("Play after pre-roll ad failed:", err));
                });
        }
    }, [isPreRollActive, currentChannel]);

    // Recurring pre-roll ad timer (every X-Y minutes at a random time)
    useEffect(() => {
        if (isPreRollActive) return;

        const minMinutes = parseInt(import.meta.env.VITE_PREROLL_AD_REAPPEAR_MIN_MINUTES) || 15;
        const maxMinutes = parseInt(import.meta.env.VITE_PREROLL_AD_REAPPEAR_MAX_MINUTES) || 30;
        const randomMinutes = Math.random() * (maxMinutes - minMinutes) + minMinutes;
        const delayMs = randomMinutes * 60 * 1000;

        console.log(`Next pre-roll ad scheduled in ${randomMinutes.toFixed(2)} minutes.`);

        const timer = setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
            setIsPreRollActive(true);
        }, delayMs);

        return () => clearTimeout(timer);
    }, [isPreRollActive]);

    const handleMouseMove = (e) => {
        const isOverTicker = e.target.closest?.('.ticker-container');
        if (isOverTicker) return;

        setShowControls(true);
        if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
        mouseTimerRef.current = setTimeout(() => {
            if (isPlaying && !showSettings) setShowControls(false);
        }, 3000);
    };

    const handleVideoTap = (e) => {
        e.stopPropagation();
        setShowControls(true);
        if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
        mouseTimerRef.current = setTimeout(() => {
            if (isPlaying && !showSettings) setShowControls(false);
        }, 3000);
    };

    const togglePlay = (e) => {
        if (e) e.stopPropagation();
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
            setShowControls(true);
        } else {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(err => console.error(err));
        }
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newState = !videoRef.current.muted;
        videoRef.current.muted = newState;
        setIsMuted(newState);
        if (!newState && volume === 0) {
            videoRef.current.volume = 0.5;
            setVolume(0.5);
        }
    };

    const adjustVolume = (amount) => {
        if (!videoRef.current) return;
        setShowControls(true);
        if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
        mouseTimerRef.current = setTimeout(() => {
            if (isPlaying && !showSettings) setShowControls(false);
        }, 3000);
        let newVolume = Math.min(1, Math.max(0, volume + amount));
        newVolume = Math.round(newVolume * 100) / 100;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        const shouldMute = newVolume === 0;
        setIsMuted(shouldMute);
        videoRef.current.muted = shouldMute;
    };

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        if (!videoRef.current) return;
        videoRef.current.volume = val;
        setVolume(val);
        setIsMuted(val === 0);
        videoRef.current.muted = val === 0;
    };

    const toggleCustomFullscreen = async () => {
        const workspace = workspaceRef.current;
        if (!workspace) return;
        try {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                if (workspace.requestFullscreen) await workspace.requestFullscreen();

                // Request landscape orientation
                if (screen.orientation?.lock) {
                    try {
                        await screen.orientation.lock('landscape');
                    } catch (err) {
                        console.warn('Orientation lock not supported:', err);
                    }
                }
            } else {
                // Exit fullscreen and unlock orientation
                if (document.exitFullscreen) await document.exitFullscreen();

                if (screen.orientation?.unlock) {
                    try {
                        screen.orientation.unlock();
                    } catch (err) {
                        console.warn('Orientation unlock not supported:', err);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const changeStreamQuality = (index) => {
        if (!hlsRef.current) return;
        hlsRef.current.currentLevel = index;
        setCurrentQuality(index);
        setShowSettings(false);
    };

    const toggleFavorite = (e, channelId) => {
        e.stopPropagation();
        const newFavorites = favorites.includes(channelId)
            ? favorites.filter(id => id !== channelId)
            : [...favorites, channelId];
        setFavorites(newFavorites);
        localStorage.setItem('favoriteChannels', JSON.stringify(newFavorites));
    };

    const getUniqueCategories = () => {
        return ['all', ...allCategories];
    };

    const getFilteredChannels = () => {
        let filtered = [...sidebarChannels];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(chan =>
                chan.name?.toLowerCase().includes(query)
            );
        }

        // Active filter (All, Favs, Sports)
        if (activeFilter === 'favs') {
            filtered = filtered.filter(chan => favorites.includes(chan.id));
            // Only apply category filter when not in sports mode
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(chan => chan.category?.toLowerCase() === selectedCategory.toLowerCase());
            }
        } else if (activeFilter === 'sports') {
            filtered = filtered.filter(chan =>
                chan.category?.toLowerCase().includes('sport')
            );
        } else {
            // Category dropdown filter only applies when activeFilter is 'all'
            if (selectedCategory !== 'all') {
                filtered = filtered.filter(chan => chan.category?.toLowerCase() === selectedCategory.toLowerCase());
            }
        }

        return filtered;
    };

    const handleChannelSwitch = (targetChannel) => {
        setCurrentChannel(targetChannel);
        navigate(`/watch/${targetChannel.id}`, { state: { channel: targetChannel, countrySlug } });
    };

    return (
        <Layout showFooter={false} showNavbar={!isCustomFullscreen} overflowHidden={true}>

            {/* Main content area */}
            <div className="flex flex-col lg:flex-row min-h-0 w-full h-[90vh]">

                {/* ── VIDEO WORKSPACE ── */}
                <div
                    ref={workspaceRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
                    className={
                        isCustomFullscreen
                            ? 'fixed inset-0 z-50 bg-black flex flex-col'
                            : 'w-full lg:flex-1 bg-black flex flex-col relative min-h-0'
                    }
                >
                    {/* Video element with ambient reflection backdrop */}
                    <div
                        className="video-container relative w-full h-full flex items-center justify-center bg-gray-950 overflow-hidden"
                        style={{ aspectRatio: isCustomFullscreen ? undefined : undefined }}
                        onClick={handleVideoTap}
                    >
                        {/* Mobile: Minimum height 50vh, Desktop: Keep 16:9 aspect ratio */}
                        <style>{`
                            @media (max-width: 767px) {
                                .video-container {
                                    min-height: 30vh !important;
                                    height: 30vh !important;
                                    aspect-ratio: unset !important;
                                    position: sticky !important;
                                    top: 0 !important;
                                    z-index: 10 !important;
                                }
                            }
                            @media (min-width: 768px) {
                                .video-container {
                                    aspect-ratio: 16/9 !important;
                                    height: unset !important;
                                    min-height: auto !important;
                                    position: relative !important;
                                    top: auto !important;
                                    z-index: auto !important;
                                }
                            }
                        `}</style>

                        {/* Background Blurred Ambient Mirror Layer */}
                        {isCustomFullscreen && currentChannel?.stream_url && (
                            <div className="absolute inset-0 w-full h-full pointer-events-none scale-125 blur-3xl opacity-40 select-none">
                                <video
                                    src={getStreamUrl(currentChannel.stream_url)}
                                    playsInline
                                    muted
                                    autoPlay
                                    loop
                                    className="w-full h-full object-cover"
                                    style={{ filter: 'brightness(0.6) contrast(1.2)' }}
                                />
                            </div>
                        )}
                        {/* Watermark logo */}
                        {!isPreRollActive && (
                            <a
                                href="https://sarker.shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-3 right-3 z-50 opacity-90 p-1.5 rounded-md bg-white/80 backdrop-blur-sm hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <img src="/logo_channel.png" alt="Sarker Shop" className="h-8 w-auto" />
                            </a>
                        )}

                        {/* Primary Main Video Player Frame (No Cuts, No Distortion) */}
                        <video
                            ref={videoRef}
                            playsInline
                            muted={isMuted}
                            className="relative z-10 w-full h-full object-contain cursor-pointer"
                            style={isCustomFullscreen ? { height: '100vh', maxWidth: '100vw' } : {}}
                        />

                        {/* Overlays */}
                        {showAd && !isPreRollActive && <ProductAd onClose={() => setShowAd(false)} />}
                        {!isPreRollActive && <NoticeTicker />}
                        {isPreRollActive && (
                            <PreRollAd
                                onClose={() => {
                                    setIsPreRollActive(false);
                                    isPreRollActiveRef.current = false;
                                    if (videoRef.current) {
                                        videoRef.current.play()
                                            .then(() => setIsPlaying(true))
                                            .catch(err => console.error("Play after pre-roll ad failed:", err));
                                    }
                                }}
                            />
                        )}

                        {/* Controls bar */}
                        <div
                            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-3 px-3 flex flex-col gap-2 z-50 transition-opacity duration-300 ${showControls && !isPreRollActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    {/* Play/Pause */}
                                    <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors cursor-pointer">
                                        {isPlaying
                                            ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                                            : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                        }
                                    </button>

                                    {/* Mute + Volume */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={toggleMute} className="text-white hover:text-yellow-400 transition-colors cursor-pointer">
                                            {isMuted
                                                ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" /></svg>
                                                : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                                            }
                                        </button>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.05"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="hidden sm:block w-16 md:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                        />
                                    </div>

                                    {/* LIVE badge */}
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {/* Settings with relative container */}
                                    <div className="relative">
                                        {/* Quality settings panel */}
                                        {showSettings && (
                                            <div className="absolute bottom-full mb-2 right-0 bg-gray-950/95 border border-gray-800 rounded-xl p-2 w-36 shadow-2xl backdrop-blur-md z-50 animate-fade-in">
                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-2 py-1 border-b border-gray-900 mb-1">Quality</p>
                                                <button onClick={() => changeStreamQuality(-1)} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${currentQuality === -1 ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-gray-900 text-gray-300'}`}>
                                                    Auto <span>⚡</span>
                                                </button>
                                                {qualities.map((q) => (
                                                    <button key={q.index} onClick={() => changeStreamQuality(q.index)} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${currentQuality === q.index ? 'bg-yellow-500 text-black font-bold' : 'hover:bg-gray-900 text-gray-300'}`}>
                                                        {q.height}p {q.height >= 720 && <span className="text-[9px] bg-red-600 text-white font-black px-1 rounded">HD</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {/* Settings button */}
                                        <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className={`p-2 transition-colors cursor-pointer ${showSettings ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                                        </button>
                                    </div>
                                    {/* Fullscreen */}
                                    <button onClick={toggleCustomFullscreen} className="p-2 bg-transparent text-gray-300 hover:text-yellow-400 cursor-pointer">
                                        {isCustomFullscreen
                                            ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" /></svg>
                                            : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── FILTERS (MOBILE ONLY, BELOW VIDEO) ── */}
                    {!isCustomFullscreen && (
                        <div className="lg:hidden w-full bg-gray-900 p-4 border-b border-gray-800 flex flex-col gap-3 shrink-0 sticky top-[40vh] z-20">
                            {/* Search bar */}
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search channels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                                />
                            </div>
                            {/* Filter tabs */}
                            <div className="flex gap-2">
                                {[
                                    { id: 'all', label: 'All', icon: '🏷️' },
                                    { id: 'favs', label: 'Favs', icon: '♡' },
                                    { id: 'sports', label: 'Sports', icon: '🏆' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFilter(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === tab.id
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Category dropdown and channel count */}
                            <div className="flex items-center gap-3">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                                >
                                    {getUniqueCategories().map((cat) => (
                                        <option key={cat} value={cat} className="bg-gray-900">
                                            {cat === 'all' ? 'All Categories' : cat}
                                        </option>
                                    ))}
                                </select>
                                <div className="text-xs font-medium text-gray-400 shrink-0">
                                    {totalChannels > 0 ? totalChannels : getFilteredChannels().length} channels
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SIDEBAR / CHANNEL LIST ── */}
                {!isCustomFullscreen && (
                    <div className="w-full lg:w-80 bg-gray-900/30 border-t border-gray-800 lg:border-t-0 lg:border-l flex flex-col shrink-0 lg:h-[calc(100dvh-64px)] overflow-hidden z-10">

                        {/* Sidebar header */}
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex flex-col gap-4 shrink-0">
                            <Link to={countrySlug ? `/country/${countrySlug}` : '/'} className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer font-bold transition-colors group hidden lg:flex">
                                <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Exit Player
                            </Link>

                            {/* Search bar (DESKTOP ONLY) */}
                            <div className="relative hidden lg:block">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search channels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/80 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                                />
                            </div>

                            {/* Filter tabs (DESKTOP ONLY) */}
                            <div className="hidden lg:flex gap-2">
                                {[
                                    { id: 'all', label: 'All', icon: '🏷️' },
                                    { id: 'favs', label: 'Favs', icon: '♡' },
                                    { id: 'sports', label: 'Sports', icon: '🏆' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFilter(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === tab.id
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Category dropdown (DESKTOP ONLY) */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="hidden lg:block w-full px-3 py-2 bg-gray-900/80 border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all"
                            >
                                {getUniqueCategories().map((cat) => (
                                    <option key={cat} value={cat} className="bg-gray-90">
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>

                            {/* Channel count (DESKTOP ONLY) */}
                            <div className="text-xs text-gray-400 font-medium hidden lg:block">
                                {totalChannels > 0 ? totalChannels : getFilteredChannels().length} channels
                            </div>
                        </div>



                        {/* Channel list */}
                        <div
                            ref={channelListRef}
                            onScroll={handleScroll}
                            className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1 lg:flex-1 lg:max-h-none max-h-[50vh]"
                        >
                            {getFilteredChannels().length === 0 ? (
                                <p className="text-xs text-gray-600 text-center py-6">No channels found</p>
                            ) : (
                                getFilteredChannels().map((chan, index) => {
                                    const isSelected = chan.id === currentChannel?.id;
                                    const isFav = favorites.includes(chan.id);
                                    return (
                                        <div
                                            key={chan.id}
                                            onClick={() => handleChannelSwitch(chan)}
                                            className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                                ? 'bg-gradient-to-r from-red-600/10 to-red-700/10 border border-red-500/30'
                                                : 'hover:bg-gray-900/60 border border-transparent'
                                                }`}
                                        >
                                            {/* Channel number icon */}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isSelected
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-800 text-gray-400'
                                                }`}>
                                                {chan.logo ? (
                                                    <img src={chan.logo} alt="" className="w-full h-full object-contain rounded-lg" />
                                                ) : (
                                                    '#'
                                                )}
                                            </div>

                                            {/* Channel info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${isSelected ? 'text-red-400' : 'text-gray-200'}`}>
                                                    {chan.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {chan.category || 'Live TV'}
                                                </p>
                                            </div>

                                            {/* Share icon (placeholder) & Favorite button */}
                                            <div className="flex items-center gap-2">
                                                <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => toggleFavorite(e, chan.id)}
                                                    className={`p-1.5 transition-colors ${isFav
                                                        ? 'text-red-400 hover:text-red-300'
                                                        : 'text-gray-500 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill={isFav ? 'currentColor' : 'none'}
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Selected indicator */}
                                            {isSelected && (
                                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full" />
                                            )}
                                        </div>
                                    );
                                })
                            )}

                            {/* Loading indicator for infinite scroll */}
                            {loadingChannels && (
                                <div className="flex justify-center py-4">
                                    <div className="w-6 h-6 border-2 border-gray-600 border-t-yellow-500 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
