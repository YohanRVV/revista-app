import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useState } from 'react';

function resolveImage(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

function StatCard({ label, value, hint }) {
    return (
        <div className="bg-white rounded-xl border border-ink-900/10 p-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink-900/50 mb-2">{label}</p>
            <p className="font-display text-4xl font-black tracking-tight">{value}</p>
            {hint && <p className="text-xs text-ink-900/50 mt-1">{hint}</p>}
        </div>
    );
}

function MagazineCard({ magazine, onDelete }) {
    const cover = resolveImage(magazine.cover_image);
    return (
        <div className="group bg-white rounded-xl border border-ink-900/10 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition duration-300">
            <div className="aspect-[16/10] bg-gradient-to-br from-ink-900 to-ink-700 relative overflow-hidden">
                {cover ? (
                    <img src={cover} alt="" className="w-full h-full object-cover opacity-90" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 via-rose-400 to-red-500 flex items-center justify-center">
                        <span className="font-display text-6xl font-black text-white/90">
                            {magazine.title.charAt(0)}
                        </span>
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    {magazine.is_published ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            Publicada
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-ink-900/80 text-white px-2.5 py-1 rounded-full shadow-sm backdrop-blur">
                            Borrador
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5">
                {magazine.issue && (
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-semibold mb-1.5">
                        {magazine.issue}
                    </p>
                )}
                <h3 className="font-display font-bold text-lg leading-tight mb-2 line-clamp-2">
                    {magazine.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-ink-900/50 mb-4">
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {magazine.pages_count} páginas
                    </span>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-ink-900/5">
                    <Link
                        href={route('admin.magazines.edit', magazine.id)}
                        className="flex-1 text-center text-xs font-semibold uppercase tracking-[0.15em] bg-ink-900 text-white px-3 py-2 rounded-md hover:bg-ink-700 transition"
                    >
                        Editar
                    </Link>
                    {magazine.is_published && (
                        <Link
                            href={route('magazines.show', magazine.slug)}
                            target="_blank"
                            className="text-xs font-semibold uppercase tracking-[0.15em] px-3 py-2 rounded-md border border-ink-900/15 hover:bg-ink-900/5 transition"
                        >
                            Ver
                        </Link>
                    )}
                    <button
                        onClick={() => onDelete(magazine)}
                        className="p-2 rounded-md text-red-600/70 hover:bg-red-50 hover:text-red-700 transition"
                        aria-label="Eliminar"
                        title="Eliminar"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ magazines }) {
    const [filter, setFilter] = useState('all');

    const filtered = magazines.filter((m) => {
        if (filter === 'published') return m.is_published;
        if (filter === 'draft') return !m.is_published;
        return true;
    });

    const stats = {
        total: magazines.length,
        published: magazines.filter((m) => m.is_published).length,
        drafts: magazines.filter((m) => !m.is_published).length,
        pages: magazines.reduce((sum, m) => sum + (m.pages_count || 0), 0),
    };

    function destroy(magazine) {
        if (confirm(`¿Eliminar "${magazine.title}"? Esta acción borrará también sus páginas y no se puede deshacer.`)) {
            router.delete(route('admin.magazines.destroy', magazine.id));
        }
    }

    return (
        <AdminLayout
            title="Revistas"
            breadcrumbs={[{ label: 'Admin' }, { label: 'Revistas' }]}
            actions={
                <Link
                    href={route('admin.magazines.create')}
                    className="inline-flex items-center gap-2 bg-ink-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-ink-700 transition shadow-sm"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nueva revista
                </Link>
            }
        >
            <Head title="Admin · Revistas" />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total" value={stats.total} hint="Todas las revistas" />
                <StatCard label="Publicadas" value={stats.published} hint="Visibles al público" />
                <StatCard label="Borradores" value={stats.drafts} hint="Sin publicar" />
                <StatCard label="Páginas" value={stats.pages} hint="En total" />
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="inline-flex rounded-lg bg-white border border-ink-900/10 p-1 text-sm">
                    {[
                        { k: 'all', label: 'Todas' },
                        { k: 'published', label: 'Publicadas' },
                        { k: 'draft', label: 'Borradores' },
                    ].map((f) => (
                        <button
                            key={f.k}
                            onClick={() => setFilter(f.k)}
                            className={`px-4 py-1.5 rounded-md font-medium transition ${
                                filter === f.k ? 'bg-ink-900 text-white' : 'text-ink-900/60 hover:text-ink-900'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-ink-900/50">
                    {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
                </p>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="bg-white border border-dashed border-ink-900/15 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-ink-900/5 flex items-center justify-center">
                        <svg className="w-6 h-6 text-ink-900/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <p className="font-display text-2xl mb-1">
                        {magazines.length === 0 ? 'Aún no hay revistas' : 'Sin resultados para este filtro'}
                    </p>
                    <p className="text-sm text-ink-900/50 mb-6">
                        {magazines.length === 0
                            ? 'Crea tu primera edición para comenzar.'
                            : 'Prueba con otro filtro o crea una nueva.'}
                    </p>
                    {magazines.length === 0 && (
                        <Link
                            href={route('admin.magazines.create')}
                            className="inline-flex items-center gap-2 bg-ink-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-ink-700 transition"
                        >
                            Crear primera revista
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map((m) => (
                        <MagazineCard key={m.id} magazine={m} onDelete={destroy} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
