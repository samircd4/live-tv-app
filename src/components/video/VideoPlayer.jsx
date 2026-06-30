import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ProductAd } from './ProductAd';
import { NoticeTicker } from './NoticeTicker';
import { PreRollAd } from './PreRollAd';

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

export const VideoPlayer = ({ currentChannel, isCustomFullscreen, setIsCustomFullscreen }) => {
    const workspaceRef = useRef(null);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const mouseTimerRef = useRef(null);

    const [showAd, setShowAd] = useState(false);
    const [isFirstAdShow, setIsFirstAdShow] = useState(true);
    const [isPreRollActive, setIsPreRollActive] = useState(true);
    const isPreRollActiveRef = useRef(true);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [qualities, setQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        isPreRollActiveRef.current = isPreRollActive;
    }, [isPreRollActive]);

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
        setShowControls(true);

        video.volume = volume;
        video.muted = true;
        setIsMuted(true);

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        const executeAutoplay = () => {
            if (isPreRollActiveRef.current) return;
            video.play()
                .then(() => setIsPlaying(true))
                .catch(() => {
                    video.muted = true;
                    setIsMuted(true);
                    video.play().then(() => setIsPlaying(true)).catch(err => console.warn("Autoplay blocked", err));
                });
        };

        const resolvedUrl = getStreamUrl(currentChannel.stream_url);

        if (Hls.isSupported()) {
            const hls = new Hls({ maxMaxBufferLength: 15, enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            hls.loadSource(resolvedUrl);
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
            video.src = resolvedUrl;
            video.addEventListener('loadedmetadata', executeAutoplay);
        }

        const handleFullscreenChange = () => {
            setIsCustomFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [currentChannel]);

    useEffect(() => {
        if (showAd || isPreRollActive) return;
        let delayMs = isFirstAdShow ? 15 * 1000 : (parseFloat(import.meta.env.VITE_PRODUCT_AD_REAPPEAR_MINUTES) || 5) * 60 * 1000;
        const timer = setTimeout(() => {
            setShowAd(true);
            setIsFirstAdShow(false);
        }, delayMs);
        return () => clearTimeout(timer);
    }, [showAd, isPreRollActive, isFirstAdShow]);

    const handleMouseMove = () => {
        setShowControls(true);
        if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
        mouseTimerRef.current = setTimeout(() => {
            if (isPlaying && !showSettings && !isPreRollActive) setShowControls(false);
        }, 3500);
    };

    const togglePlay = (e) => {
        if (e) e.stopPropagation();
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
            setShowControls(true);
        } else {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(err => console.error(err));
        }
    };

    const toggleMute = () => {
        const newState = !videoRef.current.muted;
        videoRef.current.muted = newState;
        setIsMuted(newState);
    };

    const adjustVolume = (amount) => {
        if (!videoRef.current) return;
        let newVolume = Math.min(1, Math.max(0, volume + amount));
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        videoRef.current.muted = newVolume === 0;
    };

    const toggleCustomFullscreen = async () => {
        const workspace = workspaceRef.current;
        if (!workspace) return;
        if (!document.fullscreenElement) {
            await workspace.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    const handlePreRollClose = () => {
        setIsPreRollActive(false);
        isPreRollActiveRef.current = false;
        
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
                videoRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(err => console.error("Post-Preroll stream resume block:", err));
            }
        }, 0);
    };

    return (
        <div 
            ref={workspaceRef} 
            onMouseMove={handleMouseMove} 
            onMouseLeave={() => { if (isPlaying && !isPreRollActive) setShowControls(false); }}
            className={isCustomFullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col' : 'w-full h-[30vh] lg:h-auto lg:flex-1 bg-black flex flex-col relative min-h-0 shrink-0 lg:shrink'}
        >
            <div className="video-container relative w-full h-full flex items-center justify-center bg-gray-950 overflow-hidden" onClick={() => setShowControls(true)}>
                <style>{`
                    @media (max-width: 767px) { .video-container { min-height: 30vh !important; height: 30vh !important; position: sticky !important; top: 0 !important; z-index: 10 !important; } }
                    @media (min-width: 768px) { .video-container { aspect-ratio: 16/9 !important; height: auto !important; } }
                `}</style>
                
                <video ref={videoRef} playsInline muted={isMuted} className="relative z-10 w-full h-full object-contain cursor-pointer" onClick={togglePlay} />

                {!isPreRollActive && (
                    <a href="https://sarker.shop" target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 z-40 p-1.5 rounded-md bg-white/80 backdrop-blur-sm transition-opacity duration-300">
                        <img src="/logo_channel.png" alt="Sarker Shop" className="h-7 w-auto" />
                    </a>
                )}

                {showAd && !isPreRollActive && (
                    <div className="absolute inset-x-0 bottom-20 z-40 flex justify-center px-4 pointer-events-auto">
                        <ProductAd onClose={() => setShowAd(false)} />
                    </div>
                )}

                {!isPreRollActive && (
                    <div className="absolute bottom-14 inset-x-0 z-30 pointer-events-none">
                        <NoticeTicker />
                    </div>
                )}

                {isPreRollActive && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
                        <PreRollAd onClose={handlePreRollClose} />
                    </div>
                )}

                <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-14 pb-3 px-4 flex flex-col gap-2 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="text-white text-lg cursor-pointer hover:text-red-500 transition-colors">
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <button onClick={toggleMute} className="text-white text-lg cursor-pointer hover:text-red-500 transition-colors">
                                {isMuted ? '🔇' : '🔊'}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={isMuted ? 0 : volume} 
                                onChange={(e) => adjustVolume(parseFloat(e.target.value))} 
                                className="hidden sm:block w-20 h-1 accent-red-600 bg-gray-700 rounded-lg cursor-pointer" 
                            />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded text-[10px] font-black uppercase tracking-wider animate-pulse text-white">LIVE</div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {showSettings && (
                                    <div className="absolute bottom-full mb-2 right-0 bg-gray-950 border border-gray-800 rounded-xl p-2 w-36 shadow-2xl z-50">
                                        <button onClick={() => { if(hlsRef.current) hlsRef.current.currentLevel = -1; setCurrentQuality(-1); setShowSettings(false); }} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs ${currentQuality === -1 ? 'bg-red-600 text-white font-bold' : 'text-gray-300 hover:bg-gray-800'}`}>Auto</button>
                                        {qualities.map((q) => (
                                            <button key={q.index} onClick={() => { if(hlsRef.current) hlsRef.current.currentLevel = q.index; setCurrentQuality(q.index); setShowSettings(false); }} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs ${currentQuality === q.index ? 'bg-red-600 text-white font-bold' : 'text-gray-300 hover:bg-gray-800'}`}>{q.height}p</button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }} className="text-gray-300 hover:text-white text-lg cursor-pointer transition-colors">⚙️</button>
                            </div>
                            <button onClick={toggleCustomFullscreen} className="text-gray-300 hover:text-white text-lg cursor-pointer transition-colors">⛶</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};