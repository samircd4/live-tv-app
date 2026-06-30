import { Link } from 'react-router-dom';

export const ChannelSidebar = ({
    countrySlug,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedCategory,
    setSelectedCategory,
    allCategories,
    totalChannels,
    filteredChannels,
    currentChannel,
    favorites,
    toggleFavorite,
    handleChannelSwitch,
    handleScroll,
    loadingChannels
}) => {
    return (
        <div className="w-full lg:w-80 bg-gray-900/30 border-t border-gray-800 lg:border-t-0 lg:border-l flex flex-col shrink-0 lg:h-full overflow-hidden z-10 min-h-0">
            <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex flex-col gap-3 shrink-0">
                <Link to={countrySlug ? `/country/${countrySlug}` : '/'} className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5 font-bold transition-colors">
                    ← Exit Player
                </Link>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search channels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    {[{ key: 'all', label: '🔥 All' }, { key: 'favs', label: '♡ Favs' }, { key: 'sports', label: '🏆 Sports' }].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveFilter(tab.key);
                                if (tab.key === 'sports') setSelectedCategory('all');
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${activeFilter === tab.key ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:text-white focus:outline-none"
                >
                    {allCategories.map((cat) => (
                        <option 
                            key={cat.id} 
                            value={cat.id} 
                            className="bg-gray-950 text-gray-200"
                        >
                            {cat.name}
                        </option>
                    ))}
                </select>

                <div className="text-xs text-gray-400 font-medium">
                    {totalChannels} channels available
                </div>
            </div>

            <style>{`
                .custom-sidebar-scroll::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-sidebar-scroll::-webkit-scrollbar-thumb {
                    background: rgba(239, 68, 68, 0.2);
                    border-radius: 10px;
                }
                .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(239, 68, 68, 0.4);
                }
            `}</style>

            <div 
                onScroll={handleScroll} 
                className="custom-sidebar-scroll p-2 space-y-1 overflow-y-auto flex-1 h-full min-h-0 lg:max-h-none max-h-[45vh]"
                style={{ contentVisibility: 'auto' }}
            >
                {filteredChannels.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-xs">No channels listed</div>
                ) : (
                    filteredChannels.map((chan) => {
                        const isSelected = chan.id === currentChannel?.id;
                        const isFav = favorites.includes(chan.id);
                        
                        const displayCategory = chan.category_name || 'Live TV';

                        return (
                            <div
                                key={chan.id}
                                onClick={() => handleChannelSwitch(chan)}
                                className={`relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-gradient-to-r from-red-600/10 to-red-700/10 border-red-500/30' : 'hover:bg-gray-900/60 border-transparent'}`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                    {chan.logo ? <img src={chan.logo} alt="" className="w-full h-full object-contain rounded-lg" /> : '#'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isSelected ? 'text-red-400' : 'text-gray-200'}`}>{chan.name}</p>
                                    <p className="text-[11px] text-gray-500">{displayCategory}</p>
                                </div>
                                <button 
                                    onClick={(e) => toggleFavorite(e, chan.id)} 
                                    className={`p-1 text-sm ${isFav ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {isFav ? '♥' : '♡'}
                                </button>
                                {isSelected && <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-red-600 rounded-r-full" />}
                            </div>
                        );
                    })
                )}
                {loadingChannels && (
                    <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-gray-700 border-t-yellow-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};