import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';

const Page = forwardRef(({ image, caption, number, blank }, ref) => (
    <div ref={ref} className="bg-white">
        {blank ? (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <div className="text-white/20 text-xs uppercase tracking-[0.3em]">Fin</div>
            </div>
        ) : (
            <div className="relative w-full h-full select-none">
                <img
                    src={image}
                    alt={caption || `Página ${number}`}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent text-white text-[11px] tracking-wider uppercase px-4 py-2.5 flex justify-between items-end">
                    <span className="truncate font-medium">{caption}</span>
                    <span className="tabular-nums opacity-70">{String(number).padStart(2, '0')}</span>
                </div>
            </div>
        )}
    </div>
));
Page.displayName = 'Page';

export default function Flipbook({ pages }) {
    const bookRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [dims, setDims] = useState({ width: 400, height: 560 });

    // Con showCover=true, la portada va sola y el resto debe ser par
    // para que cada flip sea un spread completo.
    const safePages = useMemo(() => {
        const list = [...pages];
        if ((list.length - 1) % 2 !== 0) {
            list.push({ id: '__back__', __blank: true });
        }
        return list;
    }, [pages]);

    useEffect(() => {
        function measure() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const isMobile = w < 900;
            const availableH = Math.max(h - 220, 420);

            let width, height;
            if (isMobile) {
                const availableW = Math.min(w - 32, 480);
                width = Math.min(availableW, availableH / 1.4);
                height = width * 1.4;
            } else {
                const availableW = Math.min(w - 80, 1200);
                width = Math.min(availableW / 2, availableH / 1.4);
                height = width * 1.4;
            }
            setDims({ width: Math.floor(width), height: Math.floor(height) });
        }
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const total = pages.length;

    return (
        <div className="w-full flex flex-col items-center gap-8">
            <HTMLFlipBook
                ref={bookRef}
                key={`${dims.width}x${dims.height}`}
                width={dims.width}
                height={dims.height}
                size="fixed"
                showCover={true}
                drawShadow={true}
                flippingTime={700}
                maxShadowOpacity={0.5}
                mobileScrollSupport={true}
                swipeDistance={30}
                onFlip={(e) => setCurrentPage(e.data)}
            >
                {safePages.map((p, i) => (
                    <Page
                        key={p.id ?? i}
                        image={p.image}
                        caption={p.caption}
                        number={i + 1}
                        blank={p.__blank}
                    />
                ))}
            </HTMLFlipBook>

            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full px-2 py-1.5 shadow-2xl">
                <button
                    onClick={() => bookRef.current?.pageFlip()?.flip(0)}
                    className="hover:bg-white/10 rounded-full w-9 h-9 flex items-center justify-center transition"
                    aria-label="Portada"
                    title="Portada"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                    </svg>
                </button>
                <button
                    onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                    className="hover:bg-white/10 rounded-full w-9 h-9 flex items-center justify-center transition"
                    aria-label="Página anterior"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className="text-xs tabular-nums tracking-[0.2em] px-3 font-medium">
                    {String(currentPage + 1).padStart(2, '0')}
                    <span className="opacity-40 mx-1">/</span>
                    {String(total).padStart(2, '0')}
                </span>
                <button
                    onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                    className="hover:bg-white/10 rounded-full w-9 h-9 flex items-center justify-center transition"
                    aria-label="Página siguiente"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
                <button
                    onClick={() => bookRef.current?.pageFlip()?.flip(safePages.length - 1)}
                    className="hover:bg-white/10 rounded-full w-9 h-9 flex items-center justify-center transition"
                    aria-label="Final"
                    title="Final"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="13 17 18 12 13 7" />
                        <polyline points="6 17 11 12 6 7" />
                    </svg>
                </button>
            </div>

            <p className="text-white/40 text-xs tracking-wider uppercase text-center">
                Arrastra la esquina · toca los lados · usa los controles
            </p>
        </div>
    );
}
