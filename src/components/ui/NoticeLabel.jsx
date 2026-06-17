"use client";
import { useEffect, useRef } from "react";

export default function NoticeLabel() {
    const imgRef = useRef(null);

    useEffect(() => {
        const anims = [
            "logo-anim-pulse",
            "logo-anim-float",
            "logo-anim-glow",
            "logo-anim-flip",
        ];
        let i = 0;

        const cycle = () => {
            const el = imgRef.current;
            if (!el) return;
            el.className = el.className
                .split(" ")
                .filter((c) => !c.startsWith("logo-anim-"))
                .join(" ");
            void el.offsetWidth; // reflow
            el.classList.add(anims[i % anims.length]);
            i++;
        };

        cycle();
        const id = setInterval(cycle, 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <img
            ref={imgRef}
            src="/logo_channel.png"
            alt="Logo"
            className="h-3 sm:h-5 md:h-10 lg:h-full w-auto object-contain"
        />
    );
}