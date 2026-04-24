import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Flipbook from '@/Components/Magazine/Flipbook';

function resolveImage(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

export default function Viewer({ magazine }) {
    const pages = (magazine.pages || []).map((p) => ({
        ...p,
        image: resolveImage(p.image),
    }));

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function onFsChange() {
            setIsFullscreen(Boolean(document.fullscreenElement));
        }
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }

    return (
        <>
            <Head title={magazine.title} />

            <div className="min-h-screen bg-ink-950 text-white flex flex-col relative overflow-hidden">
                {/* ambient gradient */}
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none"
                />
                <div aria-hidden className="absolute inset-0 noise opacity-[0.03] pointer-events-none" />

                <header className="relative border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link
                            href={route('home')}
                            className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition group"
                        >
                            <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/60 transition">
                                ←
                            </span>
                            <span className="uppercase tracking-[0.2em] text-xs hidden sm:inline">
                                Todas las ediciones
                            </span>
                        </Link>

                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400 mb-0.5">
                                {magazine.issue || 'Edición'}
                            </p>
                            <h1 className="font-display font-bold text-lg md:text-xl tracking-tight">
                                {magazine.title}
                            </h1>
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="w-9 h-9 rounded-full border border-white/20 hover:border-white/60 transition flex items-center justify-center"
                            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        >
                            {isFullscreen ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                                    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                                    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                                    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                                    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                                    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                                </svg>
                            )}
                        </button>
                    </div>
                </header>

                <main className="relative flex-1 flex items-center justify-center p-4 md:p-8">
                    {pages.length > 0 ? (
                        <Flipbook pages={pages} />
                    ) : (
                        <div className="text-center text-white/60 py-20">
                            <p className="font-display text-3xl mb-2">Próximamente</p>
                            <p className="text-sm">Esta revista aún no tiene páginas cargadas.</p>
                        </div>
                    )}
                </main>

                {magazine.description && (
                    <footer className="relative border-t border-white/5 py-6">
                        <p className="max-w-2xl mx-auto px-6 text-center text-sm text-white/50 italic font-serif">
                            “{magazine.description}”
                        </p>
                    </footer>
                )}
            </div>
        </>
    );
}
