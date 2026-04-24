import { Head, Link } from '@inertiajs/react';

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
    }).toUpperCase();
}

function resolveImage(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

function Placeholder({ title, seed = 1 }) {
    const gradients = [
        'from-amber-400 via-rose-400 to-red-500',
        'from-indigo-400 via-purple-500 to-pink-500',
        'from-emerald-400 via-teal-500 to-cyan-500',
        'from-slate-700 via-slate-900 to-black',
        'from-yellow-300 via-amber-500 to-orange-600',
    ];
    const g = gradients[seed % gradients.length];
    return (
        <div className={`w-full h-full bg-gradient-to-br ${g} flex items-end p-6`}>
            <div className="text-white/90">
                <div className="text-6xl font-display font-black leading-none">
                    {(title || '·').charAt(0)}
                </div>
            </div>
        </div>
    );
}

export default function Home({ magazines }) {
    const [featured, ...rest] = magazines;

    return (
        <>
            <Head title="Revista Digital" />

            <div className="min-h-screen bg-paper-50 text-ink-900">
                {/* Top bar */}
                <header className="border-b border-ink-900/10 sticky top-0 z-40 bg-paper-50/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-baseline gap-3">
                            <span className="font-display text-2xl font-black tracking-tight">Revista</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-ink-900/50 hidden sm:inline">
                                Digital · {new Date().getFullYear()}
                            </span>
                        </Link>
                        <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.2em]">
                            <Link href="/" className="hover:text-amber-600 transition">Ediciones</Link>
                            <a href="#acerca" className="hover:text-amber-600 transition hidden sm:inline">Acerca</a>
                            <Link href={route('login')} className="text-ink-900/60 hover:text-ink-900 transition">
                                Admin
                            </Link>
                        </nav>
                    </div>
                </header>

                {/* Magazine-style masthead */}
                <section className="border-b border-ink-900/10">
                    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.4em] text-ink-900/50 mb-2">
                                    Vol. {new Date().getFullYear() - 2024} · Número actual
                                </p>
                                <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter">
                                    Hojea.
                                    <br />
                                    <span className="italic text-amber-600">Lee.</span>
                                    <br />
                                    Descubre.
                                </h1>
                            </div>
                            <p className="max-w-sm text-ink-900/70 text-lg leading-relaxed text-balance">
                                Una revista digital con la experiencia tangible del papel. Cada edición,
                                página por página, con el gesto de voltear.
                            </p>
                        </div>
                    </div>
                </section>

                {magazines.length === 0 && (
                    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
                        <div className="rounded-3xl border border-dashed border-ink-900/20 p-12">
                            <p className="font-display text-3xl mb-2">Sin ediciones aún</p>
                            <p className="text-ink-900/60">Pronto publicaremos la primera edición.</p>
                        </div>
                    </section>
                )}

                {/* Featured issue */}
                {featured && (
                    <section className="border-b border-ink-900/10">
                        <div className="max-w-7xl mx-auto px-6 py-16">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="h-px w-10 bg-ink-900/30"></span>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-ink-900/60">
                                    Edición destacada
                                </span>
                            </div>

                            <Link
                                href={route('magazines.show', featured.slug)}
                                className="group grid md:grid-cols-5 gap-8 lg:gap-16 items-center"
                            >
                                <div className="md:col-span-2 aspect-[3/4] overflow-hidden shadow-2xl rounded-sm relative">
                                    {featured.cover_image ? (
                                        <img
                                            src={resolveImage(featured.cover_image)}
                                            alt={featured.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                        />
                                    ) : (
                                        <Placeholder title={featured.title} seed={featured.id} />
                                    )}
                                    <div className="absolute top-4 left-4 bg-amber-400 text-ink-900 text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 font-semibold">
                                        Nuevo
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-amber-600 font-semibold mb-4">
                                        {featured.issue || formatDate(featured.published_at)}
                                    </p>
                                    <h2 className="font-display font-black text-4xl md:text-6xl leading-[0.95] tracking-tight mb-6 group-hover:text-amber-700 transition">
                                        {featured.title}
                                    </h2>
                                    {featured.description && (
                                        <p className="text-lg text-ink-900/70 leading-relaxed mb-8 max-w-xl">
                                            {featured.description}
                                        </p>
                                    )}
                                    <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] border-b-2 border-ink-900 pb-1 group-hover:border-amber-600 group-hover:text-amber-700 transition">
                                        Comenzar a leer
                                        <span className="transition group-hover:translate-x-1">→</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </section>
                )}

                {/* Archive grid */}
                {rest.length > 0 && (
                    <section id="ediciones" className="border-b border-ink-900/10">
                        <div className="max-w-7xl mx-auto px-6 py-16">
                            <div className="flex items-center gap-3 mb-10">
                                <span className="h-px w-10 bg-ink-900/30"></span>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-ink-900/60">
                                    Archivo · {rest.length} {rest.length === 1 ? 'edición' : 'ediciones'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                                {rest.map((m) => (
                                    <Link
                                        key={m.id}
                                        href={route('magazines.show', m.slug)}
                                        className="group"
                                    >
                                        <div className="aspect-[3/4] overflow-hidden mb-5 rounded-sm shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition duration-500">
                                            {m.cover_image ? (
                                                <img
                                                    src={resolveImage(m.cover_image)}
                                                    alt={m.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                                />
                                            ) : (
                                                <Placeholder title={m.title} seed={m.id} />
                                            )}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-semibold mb-2">
                                            {m.issue || formatDate(m.published_at)}
                                        </p>
                                        <h3 className="font-display font-bold text-2xl leading-tight mb-2 group-hover:text-amber-700 transition">
                                            {m.title}
                                        </h3>
                                        {m.description && (
                                            <p className="text-sm text-ink-900/60 leading-relaxed line-clamp-3">
                                                {m.description}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* About strip */}
                <section id="acerca" className="bg-ink-950 text-paper-50 noise">
                    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
                        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-400 mb-4">Acerca</p>
                        <p className="font-display text-3xl md:text-5xl leading-snug text-balance">
                            Una revista digital que respeta el ritual
                            de <em className="italic">hojear</em>. Sin scroll infinito.
                            Sin prisas. Solo la página, y la siguiente.
                        </p>
                    </div>
                </section>

                <footer className="bg-ink-950 text-paper-50/50 border-t border-white/5">
                    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm">
                        <p>© {new Date().getFullYear()} Revista Digital</p>
                        <p className="text-xs uppercase tracking-[0.3em] opacity-60">
                            Laravel · React · react-pageflip
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
