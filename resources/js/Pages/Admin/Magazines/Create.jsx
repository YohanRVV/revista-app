import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useRef, useState } from 'react';

function Field({ label, required, hint, error, children }) {
    return (
        <div>
            <label className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-ink-900">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </span>
                {hint && <span className="text-xs text-ink-900/50">{hint}</span>}
            </label>
            {children}
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    );
}

const inputClass =
    'w-full bg-white border border-ink-900/15 rounded-lg px-3.5 py-2.5 text-sm focus:border-ink-900 focus:ring-2 focus:ring-ink-900/10 outline-none transition';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        issue: '',
        description: '',
        cover_image: null,
        is_published: false,
    });
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef();

    function handleCover(e) {
        const file = e.target.files[0];
        setData('cover_image', file);
        if (file) setPreview(URL.createObjectURL(file));
    }

    function submit(e) {
        e.preventDefault();
        post(route('admin.magazines.store'), { forceFormData: true });
    }

    return (
        <AdminLayout
            title="Nueva revista"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Revistas', href: route('admin.magazines.index') },
                { label: 'Nueva' },
            ]}
        >
            <Head title="Nueva revista" />

            <form onSubmit={submit} className="max-w-4xl">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left column */}
                    <div className="md:col-span-2 space-y-5">
                        <div className="bg-white rounded-2xl border border-ink-900/10 p-6 space-y-5">
                            <div>
                                <h2 className="font-display text-xl font-bold mb-1">Información</h2>
                                <p className="text-sm text-ink-900/50">Datos básicos de la edición.</p>
                            </div>

                            <Field label="Título" required error={errors.title}>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Ej: Revista Demo · Edición Inaugural"
                                    autoFocus
                                />
                            </Field>

                            <Field label="Edición / Número" hint="Opcional" error={errors.issue}>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.issue}
                                    onChange={(e) => setData('issue', e.target.value)}
                                    placeholder="Vol. 01 · Abril 2026"
                                />
                            </Field>

                            <Field label="Descripción" hint="Se muestra en la portada" error={errors.description}>
                                <textarea
                                    className={inputClass}
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Una breve presentación de esta edición…"
                                />
                            </Field>
                        </div>

                        <div className="bg-white rounded-2xl border border-ink-900/10 p-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 w-5 h-5 rounded border-ink-900/20 text-ink-900 focus:ring-ink-900/20"
                                    checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                />
                                <div>
                                    <p className="font-semibold text-ink-900">Publicar al guardar</p>
                                    <p className="text-sm text-ink-900/60">
                                        Si está activo, la revista será visible en el sitio público inmediatamente. Puedes cambiar esto luego.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Right column — cover */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-ink-900/10 p-6">
                            <h2 className="font-display text-xl font-bold mb-1">Portada</h2>
                            <p className="text-sm text-ink-900/50 mb-4">Imagen en proporción 3:4.</p>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[3/4] rounded-xl border-2 border-dashed border-ink-900/15 hover:border-ink-900/40 transition cursor-pointer overflow-hidden relative group"
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">
                                                Cambiar
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-900/40 p-6 text-center">
                                        <svg className="w-10 h-10 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <circle cx="9" cy="9" r="2" />
                                            <path d="M21 15l-5-5L5 21" />
                                        </svg>
                                        <p className="text-sm font-medium">Subir portada</p>
                                        <p className="text-xs mt-1">JPG o PNG · Máx 5MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCover}
                            />
                            {errors.cover_image && (
                                <p className="mt-2 text-xs text-red-600">{errors.cover_image}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <Link
                        href={route('admin.magazines.index')}
                        className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-900/60 hover:text-ink-900 px-4 py-2.5 transition"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 bg-ink-900 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-ink-700 transition disabled:opacity-50"
                    >
                        {processing ? 'Guardando…' : 'Crear revista'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
