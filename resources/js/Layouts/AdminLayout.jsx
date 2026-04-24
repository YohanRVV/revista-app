import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function NavItem({ href, active, icon, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'text-ink-900/70 hover:bg-ink-900/5 hover:text-ink-900'
            }`}
        >
            <span className="w-5 h-5 flex items-center justify-center opacity-80">{icon}</span>
            <span>{children}</span>
        </Link>
    );
}

export default function AdminLayout({ title, breadcrumbs = [], actions, children }) {
    const { auth, flash } = usePage().props;
    const [flashMsg, setFlashMsg] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setFlashMsg({ type: 'success', text: flash.success });
            const t = setTimeout(() => setFlashMsg(null), 4000);
            return () => clearTimeout(t);
        }
        if (flash?.error) {
            setFlashMsg({ type: 'error', text: flash.error });
            const t = setTimeout(() => setFlashMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const initials = (auth.user?.name || '?')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const isMagazines = route().current('admin.magazines.*');

    return (
        <div className="min-h-screen bg-paper-50 text-ink-900">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-ink-900/10 flex flex-col transition-transform ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <div className="px-6 py-5 border-b border-ink-900/10 flex items-center justify-between">
                    <Link href={route('admin.magazines.index')} className="flex items-baseline gap-2">
                        <span className="font-display text-2xl font-black tracking-tight">Revista</span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-ink-900/50">Admin</span>
                    </Link>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1 text-ink-900/60 hover:text-ink-900"
                        aria-label="Cerrar menú"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 px-3 py-5 space-y-1">
                    <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.3em] text-ink-900/40">
                        Contenido
                    </p>
                    <NavItem
                        href={route('admin.magazines.index')}
                        active={isMagazines}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                        }
                    >
                        Revistas
                    </NavItem>
                    <NavItem
                        href={route('home')}
                        active={false}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            </svg>
                        }
                    >
                        Ver sitio público
                    </NavItem>

                    <p className="px-4 pt-6 pb-2 text-[10px] uppercase tracking-[0.3em] text-ink-900/40">
                        Cuenta
                    </p>
                    <NavItem
                        href={route('profile.edit')}
                        active={route().current('profile.edit')}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 21a8 8 0 0 1 16 0" />
                            </svg>
                        }
                    >
                        Perfil
                    </NavItem>
                </nav>

                <div className="p-3 border-t border-ink-900/10">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-9 h-9 rounded-full bg-amber-400 text-ink-900 font-bold flex items-center justify-center text-sm">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{auth.user?.name}</p>
                            <p className="text-xs text-ink-900/50 truncate">{auth.user?.email}</p>
                        </div>
                        <button
                            onClick={() => router.post(route('logout'))}
                            className="text-ink-900/40 hover:text-ink-900 p-1.5 rounded transition"
                            aria-label="Cerrar sesión"
                            title="Cerrar sesión"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main */}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 bg-paper-50/80 backdrop-blur border-b border-ink-900/10">
                    <div className="px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 text-ink-900/70"
                                aria-label="Abrir menú"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </svg>
                            </button>
                            <div className="min-w-0">
                                {breadcrumbs.length > 0 && (
                                    <nav className="flex items-center gap-2 text-xs text-ink-900/50 mb-0.5">
                                        {breadcrumbs.map((b, i) => (
                                            <span key={i} className="flex items-center gap-2">
                                                {i > 0 && <span>/</span>}
                                                {b.href ? (
                                                    <Link href={b.href} className="hover:text-ink-900">
                                                        {b.label}
                                                    </Link>
                                                ) : (
                                                    <span>{b.label}</span>
                                                )}
                                            </span>
                                        ))}
                                    </nav>
                                )}
                                <h1 className="font-display font-bold text-xl md:text-2xl tracking-tight truncate">
                                    {title}
                                </h1>
                            </div>
                        </div>
                        {actions && <div className="flex-shrink-0">{actions}</div>}
                    </div>
                </header>

                {flashMsg && (
                    <div className="px-4 md:px-8 pt-4">
                        <div
                            className={`rounded-lg px-4 py-3 text-sm shadow-sm flex items-center gap-3 ${
                                flashMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                    : 'bg-red-50 text-red-900 border border-red-200'
                            }`}
                        >
                            <span>{flashMsg.type === 'success' ? '✓' : '⚠'}</span>
                            <span className="flex-1">{flashMsg.text}</span>
                            <button
                                onClick={() => setFlashMsg(null)}
                                className="opacity-60 hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <main className="px-4 md:px-8 py-8">{children}</main>
            </div>
        </div>
    );
}
