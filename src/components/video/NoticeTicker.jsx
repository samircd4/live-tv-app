import React, { useState, useEffect } from "react";
import NoticeLabel from "../ui/NoticeLabel";

export const NoticeTicker = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [paused, setPaused] = useState(false);

    const notices = [
        "🔥 সরকার শপে স্বাগতম — বাংলাদেশের অন্যতম বিশ্বস্ত স্মার্টফোন, গ্যাজেট ও অ্যাকসেসরিজের অনলাইন মার্কেটপ্লেস।",
        "📱 সর্বশেষ স্মার্টফোন সংগ্রহ করুন আকর্ষণীয় দামে এবং অফিসিয়াল ওয়ারেন্টির নিশ্চয়তায়।",
        "🚚 সারা বাংলাদেশে দ্রুত ও নিরাপদ হোম ডেলিভারি সুবিধা।",
        "🎁 নির্বাচিত পণ্যে পাচ্ছেন বিশেষ উপহার ও এক্সক্লুসিভ অফার।",
        "⚡ ফ্ল্যাশ সেল চলছে! সীমিত সময়ের জন্য পাচ্ছেন অবিশ্বাস্য ডিসকাউন্ট।",
        "💯 ১০০% অরিজিনাল পণ্য, অফিসিয়াল ওয়ারেন্টি এবং নির্ভরযোগ্য বিক্রয়োত্তর সেবা।",
        "🎧 স্মার্টওয়াচ, ইয়ারবাড, পাওয়ার ব্যাংকসহ হাজারো গ্যাজেট এখন এক প্ল্যাটফর্মে।",
        "🏆 গ্রাহকের আস্থা ও সেবার মানে সারকার শপ সবসময় এক ধাপ এগিয়ে।",
        "💳 নিরাপদ অনলাইন পেমেন্ট ও ক্যাশ অন ডেলিভারি সুবিধা উপলব্ধ।",
        "🔥 প্রতিদিন নতুন অফার, নতুন গ্যাজেট এবং সেরা দামের নিশ্চয়তা শুধুমাত্র সারকার শপে।",
    ];

    const combinedText = notices.join("   |   ") + "   •   ";

    useEffect(() => {
        const clockTimer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(clockTimer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "2-digit",
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    return (
        <div
            className="absolute inset-x-0 bottom-0 z-40 h-10 sm:h-12 md:h-16 lg:h-20 flex items-center overflow-hidden select-none border-y border-yellow-500/20 bg-black/85 backdrop-blur-xl shadow-[0_0_40px_rgba(255,193,7,0.15)]"
            onMouseEnter={(e) => {
                e.stopPropagation();
                setPaused(true);
            }}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Left Label */}
            <div className="h-full shrink-0 flex items-center bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 shadow-lg overflow-hidden">
                <NoticeLabel />
            </div>

            {/* Center Ticker Container */}
            <div className="relative flex-1 h-full overflow-hidden bg-gradient-to-r from-gray-950/80 via-black/60 to-gray-950/80 flex items-center">
                <div
                    className="flex whitespace-nowrap animate-marquee"
                    style={{
                        animationPlayState: paused ? "paused" : "running"
                    }}
                >
                    <span className="text-yellow-400 font-extrabold text-[10px] sm:text-xs md:text-sm lg:text-2xl pr-4">
                        {combinedText}
                    </span>
                    <span className="text-yellow-400 font-extrabold text-[10px] sm:text-xs md:text-sm lg:text-2xl pr-4">
                        {combinedText}
                    </span>
                </div>
            </div>

            {/* Right Information Panel */}
            <div className="h-full shrink-0 flex flex-col items-center justify-center px-1 sm:px-2 md:px-3 lg:px-6 bg-gradient-to-l from-yellow-500 via-amber-400 to-yellow-500 text-black">
                <div className="text-center font-black text-[8px] sm:text-xs md:text-sm lg:text-2xl hidden sm:block">
                    {formatDate(currentTime)}
                </div>

                <div className="font-mono text-[8px] sm:text-[10px] md:text-xs lg:text-2xl font-black tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.15em] bg-black text-yellow-400 px-1 sm:px-1 md:px-2 lg:px-4 py-0.5 rounded-lg">
                    {formatTime(currentTime)}
                </div>
            </div>
        </div>
    );
};
