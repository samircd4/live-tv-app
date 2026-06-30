import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { tvService } from '../api/tvService';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { ChannelSidebar } from '../components/video/ChannelSidebar';

export const WatchPage = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-yellow-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.75s' }}></div>
                </div>
                <p className="mt-5 text-sm text-gray-400 font-medium tracking-widest uppercase animate-pulse">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <WatchPageContent />;
};

const WatchPageContent = () => {
    const { channelId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [currentChannel, setCurrentChannel] = useState(location.state?.channel || null);
    const [sidebarChannels, setSidebarChannels] = useState([]);
    const [totalChannels, setTotalChannels] = useState(0);
    const [allCategories, setAllCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('FIFA WORLD CUP 2026');
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favoriteChannels');
        return saved ? JSON.parse(saved) : [];
    });
    const countrySlug = location.state?.countrySlug || '';

    // Build unique categories from flat API response (using category_name as the identifier)
    useEffect(() => {
        const loadInitialCategories = async () => {
            try {
                const data = await tvService.getChannels(countrySlug, 1, '');
                const channelsList = data?.results || (Array.isArray(data) ? data : []);

                const categoriesMap = new Map();
                channelsList.forEach(chan => {
                    if (chan.category_name) {
                        const catName = chan.category_name;
                        if (!categoriesMap.has(catName)) {
                            categoriesMap.set(catName, { id: catName, name: catName });
                        }
                    }
                });
                setAllCategories(Array.from(categoriesMap.values()));
            } catch (err) {
                console.error("Failed to load initial categories:", err);
            }
        };
        loadInitialCategories();
    }, [countrySlug]);

    // Fetch channels page by page from API
    const fetchChannels = useCallback(async (page = 1, append = false) => {
        if (loadingChannels) return;
        setLoadingChannels(true);

        try {
            const data = await tvService.getChannels(countrySlug, page, selectedCategory);
            let channelsList = data?.results || (Array.isArray(data) ? data : []);

            if (channelsList.length === 0) {
                if (page === 1 && selectedCategory === 'FIFA WORLD CUP 2026') {
                    setLoadingChannels(false);
                    setIsInitialLoad(false);
                    setSelectedCategory('all');
                    return;
                }
                if (!append) setSidebarChannels([]);
                setHasMorePages(false);
                setLoadingChannels(false);
                return;
            }

            if (append) {
                setSidebarChannels(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newChannels = channelsList.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newChannels];
                });
            } else {
                setSidebarChannels(channelsList);
            }

            if (data && typeof data.count === 'number') {
                setTotalChannels(data.count);
            } else if (!append) {
                setTotalChannels(channelsList.length);
            }

            setHasMorePages(!!(data && data.next));

            if (!currentChannel && channelsList.length > 0 && page === 1) {
                const matched = channelsList.find(ch => ch.id.toString() === channelId);
                setCurrentChannel(matched || channelsList[0]);
            }
        } catch (err) {
            console.error("Failed to load channels:", err);
            setHasMorePages(false);
            if (page === 1) {
                if (selectedCategory === 'FIFA WORLD CUP 2026') {
                    setLoadingChannels(false);
                    setIsInitialLoad(false);
                    setSelectedCategory('all');
                } else {
                    setSidebarChannels([]);
                }
            }
        } finally {
            setLoadingChannels(false);
            setIsInitialLoad(false);
        }
    }, [countrySlug, channelId, currentChannel, selectedCategory]);

    // Reset and reload on filter/category change
    useEffect(() => {
        setCurrentPage(1);
        setHasMorePages(true);
        setSidebarChannels([]);
        setIsInitialLoad(true);
        fetchChannels(1, false);
    }, [countrySlug, selectedCategory, activeFilter]);

    const handleScroll = (e) => {
        const container = e.target;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
            if (hasMorePages && !loadingChannels) {
                const nextPage = currentPage + 1;
                setCurrentPage(nextPage);
                fetchChannels(nextPage, true);
            }
        }
    };

    // Local filtering (now category is a flat number, filter by category_name for sports)
    const getFilteredChannels = () => {
        let filtered = [...sidebarChannels];

        if (activeFilter === 'sports') {
            filtered = filtered.filter(chan => {
                const catName = chan.category_name || '';
                return catName.toLowerCase().includes('sport');
            });
        }

        if (activeFilter === 'favs') {
            filtered = filtered.filter(chan => favorites.includes(chan.id));
        }

        if (searchQuery) {
            filtered = filtered.filter(chan => chan.name?.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return filtered;
    };

    const toggleFavorite = (e, chId) => {
        e.stopPropagation();
        const newFavs = favorites.includes(chId) ? favorites.filter(id => id !== chId) : [...favorites, chId];
        setFavorites(newFavs);
        localStorage.setItem('favoriteChannels', JSON.stringify(newFavs));
    };

    const computedCategories = useMemo(() => {
        return [{ id: 'all', name: 'All Categories' }, ...allCategories];
    }, [allCategories]);

    // Full-page spinner on first load
    if (isInitialLoad && loadingChannels) {
        return (
            <Layout showFooter={false} showNavbar={true} overflowHidden={false}>
                <div className="min-h-[80vh] flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-yellow-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.75s' }}></div>
                    </div>
                    <p className="mt-5 text-sm text-gray-400 font-medium tracking-widest uppercase animate-pulse">Loading Channels...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showFooter={false} showNavbar={!isCustomFullscreen} overflowHidden={true}>
            <div className="flex flex-col lg:flex-row min-h-0 w-full h-[90vh]">
                <VideoPlayer currentChannel={currentChannel} isCustomFullscreen={isCustomFullscreen} setIsCustomFullscreen={setIsCustomFullscreen} />
                {!isCustomFullscreen && (
                    <ChannelSidebar
                        countrySlug={countrySlug} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        activeFilter={activeFilter} setActiveFilter={setActiveFilter} selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory} allCategories={computedCategories} totalChannels={totalChannels}
                        filteredChannels={getFilteredChannels()} currentChannel={currentChannel} favorites={favorites}
                        toggleFavorite={toggleFavorite} handleChannelSwitch={(ch) => { setCurrentChannel(ch); navigate(`/watch/${ch.id}`, { state: { channel: ch, countrySlug } }); }}
                        handleScroll={handleScroll} loadingChannels={loadingChannels}
                    />
                )}
            </div>
        </Layout>
    );
};