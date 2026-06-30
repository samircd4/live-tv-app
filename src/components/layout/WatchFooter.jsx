import React, { useState, useEffect } from 'react';

export const WatchFooter = () => {
    // Stat counters initialized with realistic starter values close to the target
    const [visits, setVisits] = useState(7791422);
    const [online, setOnline] = useState(483);

    useEffect(() => {
        // Build the WebSocket URL using the VITE_API_BASE_URL environment variable
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
        let wsUrl = '';

        if (apiBaseUrl) {
            // Replace http/https protocol with ws/wss protocol
            const baseWithoutProtocol = apiBaseUrl.replace(/^https?:\/\//i, '');
            const protocol = apiBaseUrl.startsWith('https') ? 'wss:' : 'ws:';
            wsUrl = `${protocol}//${baseWithoutProtocol}/ws/live-insights/`;
        } else {
            // Fallback to local host
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${protocol}//${window.location.host}/ws/live-insights/`;
        }

        let socket = null;

        const connectWebSocket = () => {
            try {
                console.log(`Connecting to visitor tracking WebSocket at: ${wsUrl}`);
                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log('Connected to visitor tracking socket');
                    // Report initial page view
                    socket.send(JSON.stringify({
                        type: 'page_view',
                        page_url: window.location.pathname,
                        cart_items: 0
                    }));
                };

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        // Extract stats if the WebSocket sends them
                        if (data.total_visits || data.visitor_data?.total_visits) {
                            setVisits(data.total_visits || data.visitor_data.total_visits);
                        }
                        if (data.online_users || data.visitor_data?.online_users) {
                            setOnline(data.online_users || data.visitor_data.online_users);
                        }
                    } catch (err) {
                        console.error('Failed parsing tracking socket message:', err);
                    }
                };

                socket.onclose = (e) => {
                    console.log('Visitor tracking socket closed. Retrying in 10s...', e.reason);
                    setTimeout(connectWebSocket, 10000);
                };

                socket.onerror = (err) => {
                    console.error('Visitor tracking socket encountered error:', err);
                    socket.close();
                };
            } catch (err) {
                console.error('WebSocket connection setup failed:', err);
            }
        };

        connectWebSocket();

        // Periodically adjust simulated numbers slightly if socket is disconnected / not broadcasting
        // to maintain realism
        const interval = setInterval(() => {
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                // Minor fluctuations for visitor count (+0 to +3)
                setVisits(prev => prev + Math.floor(Math.random() * 4));
                // Fluctuations for online visitors (-2 to +2)
                setOnline(prev => {
                    const diff = Math.floor(Math.random() * 5) - 2;
                    return Math.max(300, Math.min(600, prev + diff));
                });
            }
        }, 5000);

        return () => {
            clearInterval(interval);
            if (socket) {
                // Disable automatic reconnect before closing
                socket.onclose = null;
                socket.close();
            }
        };
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Sarker Live TV',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled or failed:', err);
            }
        } else {
            // Fallback: Copy to Clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    const formatNumber = (num) => num.toLocaleString();

    return (
        <footer className="w-full bg-[#080d1a] border-t border-gray-800/40 py-2.5 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4 select-none shrink-0">
            {/* Copyright Statement */}
            <div className="font-semibold tracking-wide text-gray-500">
                © 2026 Sarker Shop Stream — All rights reserved
            </div>

            {/* Sharing / Social Pills */}
            <div className="flex flex-wrap items-center gap-3">
                <button 
                    onClick={handleShare}
                    className="px-3.5 py-1 rounded-full border border-gray-800/80 hover:border-gray-700 bg-gray-950/20 hover:bg-gray-900 text-gray-300 font-bold hover:text-white transition-all cursor-pointer text-[11px]"
                >
                    শেয়ার করুন
                </button>
                <a 
                    href="https://facebook.com/samircd4" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-gray-800/80 hover:border-gray-700 bg-gray-950/20 hover:bg-gray-900 text-gray-300 font-bold hover:text-white transition-all text-[11px]"
                >
                    <span className="text-[#1877F2] font-black">f</span> Follow
                </a>
            </div>

            {/* Visit & Online Badges */}
            <div className="flex items-center gap-3 font-mono">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-800/80 bg-gray-950/40 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-[#00F3FF] shadow-[0_0_8px_#00F3FF] animate-pulse" />
                    Visit: <span className="font-extrabold text-[#00F3FF]">{formatNumber(visits)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-800/80 bg-gray-950/40 text-[11px] text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
                    Online: <span className="font-extrabold text-[#10B981]">{formatNumber(online)}</span>
                </div>
            </div>
        </footer>
    );
};
