import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { tvService } from '../api/tvService';
import { useAuth } from '../context/AuthContext';
import { ProductAd } from '../components/video/ProductAd';
import { NoticeTicker } from '../components/video/NoticeTicker';
import { PreRollAd } from '../components/video/PreRollAd';
import { Navbar } from '../components/layout/Navbar';


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
    const [showAd, setShowAd] = useState(false);
    const [isFirstAdShow, setIsFirstAdShow] = useState(true);
    const [isPreRollActive, setIsPreRollActive] = useState(true);
    const isPreRollActiveRef = useRef(true);
    const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const countrySlug = location.state?.countrySlug || '';
    const [qualities, setQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        isPreRollActiveRef.current = isPreRollActive;
    }, [isPreRollActive]);

    useEffect(() => {
        const fetchSidebarData = async () => {
            if (countrySlug) {
                try {
                    const data = await tvService.getChannels(countrySlug);
                    let channelsList = Array.isArray(data) ? data : (data?.results || []);
                    setSidebarChannels(channelsList);

                    if (!currentChannel && channelsList.length > 0) {
                        const activeMatch = channelsList.find(ch => ch.id.toString() === channelId);
                        if (activeMatch) setCurrentChannel(activeMatch);
                    }
                } catch (err) {
                    console.error("Failed to load sidebar matrix tracks:", err);
                }
            }
        };
        fetchSidebarData();
    }, [channelId, countrySlug, currentChannel]);

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
        setShowAd(false);
        setIsFirstAdShow(true);
        setIsPlaying(false);
        setQualities([]);
        setCurrentQuality(-1);
        setShowSettings(false);

        video.volume = volume;
        video.muted = isMuted;

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
                if (hls.levels && hls.levels.length > 0 && qualities.length === 0) {
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
            setIsCustomFullscreen(!!document.fullscreenElement);
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

    // Recurring ad reappear timer (configured via .env in minutes, delayed if pre-roll active)
    useEffect(() => {
        if (showAd || isPreRollActive) return;

        let delayMs;
        if (isFirstAdShow) {
            delayMs = 60 * 1000; // 60 seconds on the first time
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

    // Trigger video playback after pre-roll ad finishes or is skipped
    useEffect(() => {
        if (!isPreRollActive && videoRef.current && currentChannel?.stream_url) {
            const video = videoRef.current;
            video.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                    // Muted autoplay fallback
                    video.muted = true;
                    setIsMuted(true);
                    video.play()
                        .then(() => setIsPlaying(true))
                        .catch(err => console.error("Play after pre-roll ad failed:", err));
                });
        }
    }, [isPreRollActive, currentChannel]);

    // Recurring pre-roll ad timer (every 15-30 minutes at a random time)
    useEffect(() => {
        if (isPreRollActive) return;

        const minMinutes = 15;
        const maxMinutes = 30;
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
        const isOverTicker = e.target.closest('.ticker-container');
        if (isOverTicker) return;

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
                if (workspace.requestFullscreen) await workspace.requestFullscreen();
            } else {
                if (document.exitFullscreen) await document.exitFullscreen();
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

    const handleChannelSwitch = (targetChannel) => {
        setCurrentChannel(targetChannel);
        navigate(`/watch/${targetChannel.id}`, { state: { channel: targetChannel, countrySlug } });
    };

    return (
        <div className="h-screen max-h-screen bg-gray-950 text-white font-sans flex flex-col overflow-hidden select-none">
            {!isCustomFullscreen && <Navbar />}

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden relative">
                <div
                    ref={workspaceRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
                    className={`flex-1 bg-black flex flex-col relative min-h-0 overflow-hidden group ${isCustomFullscreen ? 'h-screen w-screen fixed inset-0 z-50 bg-black' : ''}`}
                >
                    <div className="flex-1 relative w-full h-full flex items-center justify-center bg-black overflow-hidden">

                        {/* LOGO ADDED HERE */}
                        {!isPreRollActive && (
                            <a
                                href="https://sarker.shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-4 right-4 z-50 opacity-90 p-2 rounded-md bg-white/80 backdrop-blur-sm hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <img src="/logo_channel.png" alt="Sarker Shop" className="h-10 w-auto" />
                            </a>
                        )}

                        <video
                            ref={videoRef}
                            playsInline
                            onClick={togglePlay}
                            className="w-full h-full object-cover max-h-full cursor-pointer"
                        />
                        {showAd && !isPreRollActive && <ProductAd onClose={() => setShowAd(false)} />}
                        {!isPreRollActive && <NoticeTicker />}
                        {isPreRollActive && (
                            <PreRollAd 
                                onClose={() => setIsPreRollActive(false)} 
                                skipDelaySeconds={10} 
                                totalDurationSeconds={30} 
                            />
                        )}
                        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-16 pb-3 px-4 flex flex-col gap-3 z-50 transition-opacity duration-300 ${showControls && !isPreRollActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            {showSettings && (
                                <div className="absolute bottom-16 right-14 bg-gray-950/95 border border-gray-800 rounded-xl p-2 w-40 shadow-2xl backdrop-blur-md z-50 animate-fade-in">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold px-2 py-1 border-b border-gray-900 mb-1">Quality Settings</p>
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
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors cursor-pointer">
                                        {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button onClick={toggleMute} className="text-white hover:text-yellow-400 transition-colors cursor-pointer">
                                            {isMuted ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>}
                                        </button>
                                        <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-16 md:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className={`p-2 transition-colors cursor-pointer ${showSettings ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                                    </button>
                                    <button onClick={toggleCustomFullscreen} className="p-2 bg-transparent text-gray-300 hover:text-yellow-400 cursor-pointer">
                                        {isCustomFullscreen ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isCustomFullscreen && (
                    <div className="w-full lg:w-80 bg-gray-900/30 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col shrink-0 min-h-0 h-full z-10">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex flex-col gap-2.5">
                            <Link to={countrySlug ? `/country/${countrySlug}` : "/"} className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer font-bold transition-colors group">
                                <span className="transform group-hover:-translate-x-0.5 transition-transform">←</span> Exit Player
                            </Link>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Station Matrix</h3>
                        </div>
                        <div className="p-2 space-y-1 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                            {sidebarChannels.map((chan) => {
                                const isSelected = chan.id === currentChannel?.id;
                                return (
                                    <div key={chan.id} onClick={() => handleChannelSwitch(chan)} className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' : 'hover:bg-gray-900/60 border border-transparent text-gray-300'}`}>
                                        <div className="w-8 h-8 bg-gray-950 border border-gray-800 rounded flex items-center justify-center text-xs font-bold shrink-0">
                                            {chan.logo ? <img src={chan.logo} alt="" className="w-full h-full object-contain" /> : '📺'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{chan.name}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
