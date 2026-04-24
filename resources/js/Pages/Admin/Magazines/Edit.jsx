import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useRef, useState } from 'react';

function resolveImage(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
}

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

function Card({ title, description, children, footer }) {
    return (
        <div className="bg-white rounded-2xl border border-ink-900/10 overflow-hidden">
            <div className="p-6 border-b border-ink-900/5">
                <h2 className="font-display text-xl font-bold">{title}</h2>
                {description && <p className="text-sm text-ink-900/50 mt-1">{description}</p>}
            </div>
            <div className="p-6 space-y-5">{children}</div>
            {footer && <div className="px-6 py-4 bg-ink-900/[0.02] border-t border-ink-900/5">{footer}</div>}
        </div>
    );
}

export default function Edit({ magazine }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        title: magazine.title || '',
        issue: magazine.issue || '',
        description: magazine.description || '',
        cover_image: null,
        is_published: magazine.is_published,
    });

    const pagesForm = useForm({
        images: [],
    });

    const [coverPreview, setCoverPreview] = useState(null);
    const [pagePreviews, setPagePreviews] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef();
    const pagesInputRef = useRef();

    function handleCover(e) {
        const file = e.target.files[0];
        setData('cover_image', file);
        if (file) setCoverPreview(URL.createObjectURL(file));
    }

    function handlePagesSelect(files) {
        const arr = Array.from(files);
        pagesForm.setData('images', arr);
        setPagePreviews(arr.map((f) => URL.createObjectURL(f)));
    }

    function onDrop(e) {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            handlePagesSelect(e.dataTransfer.files);
        }
    }

    function submitInfo(e) {
        e.preventDefault();
        post(route('admin.magazines.update', magazine.id), { forceFormData: true });
    }

    function submitPages(e) {
        e.preventDefault();
        pagesForm.post(route('admin.magazines.pages.store', magazine.id), {
            forceFormData: true,
            onSuccess: () => {
                pagesForm.reset();
                setPagePreviews([]);
                if (pagesInputRef.current) pagesInputRef.current.value = '';
            },
        });
    }

    function deletePage(pageId) {
        if (confirm('¿Eliminar esta página?')) {
            router.delete(route('admin.magazines.pages.destroy', [magazine.id, pageId]), {
                preserveScroll: true,
            });
        }
    }

    return (
        <AdminLayout
            title={magazine.title}
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Revistas', href: route('admin.magazines.index') },
                { label: 'Editar' },
            ]}
            actions={
                magazine.is_published && (
                    <Link
                        href={route('magazines.show', magazine.slug)}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg border border-ink-900/15 hover:bg-ink-900/5 transition"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        Ver pública
                    </Link>
                )
            }
        >
            <Head title={`Editar · ${magazine.title}`} />

            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                {/* Info */}
                <div className="lg:col-span-2">
                    <form onSubmit={submitInfo}>
                        <Card
                            title="Información general"
                            description="Título, número y descripción de la edición."
                            footer={
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-ink-900/20 text-ink-900 focus:ring-ink-900/20"
                                            checked={data.is_published}
                                            onChange={(e) => setData('is_published', e.target.checked)}
                                        />
                                        <span className="text-sm">
                                            {data.is_published ? (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                                    Publicada
                                                </span>
                                            ) : (
                                                <span className="text-ink-900/60">Borrador</span>
                                            )}
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-ink-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-ink-700 transition disabled:opacity-50"
                                    >
                                        {processing ? 'Guardando…' : 'Guardar cambios'}
                                    </button>
                                </div>
                            }
                        >
                            <Field label="Título" required error={errors.title}>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                            </Field>

                            <Field label="Edición / Número" error={errors.issue}>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={data.issue}
                                    onChange={(e) => setData('issue', e.target.value)}
                                />
                            </Field>

                            <Field label="Descripción" error={errors.description}>
                                <textarea
                                    className={inputClass}
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </Field>
                        </Card>
                    </form>
                </div>

                {/* Cover */}
                <div>
                    <Card title="Portada" description="Imagen de portada para el listado.">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-ink-900/15 hover:border-ink-900/40 transition cursor-pointer overflow-hidden relative group"
                        >
                            {(coverPreview || magazine.cover_image) ? (
                                <>
                                    <img
                                        src={coverPreview || resolveImage(magazine.cover_image)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/50 transition flex items-center justify-center">
                                        <span className="text-white text-xs font-semibold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition">
                                            Cambiar portada
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
                            <p className="text-xs text-red-600">{errors.cover_image}</p>
                        )}
                    </Card>
                </div>
            </div>

            {/* Páginas */}
            <Card
                title={`Páginas · ${magazine.pages.length}`}
                description="Ordenadas según aparecen en la revista. Sube nuevas páginas y se añadirán al final."
            >
                {/* Uploader */}
                <form onSubmit={submitPages}>
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        onClick={() => pagesInputRef.current?.click()}
                        className={`rounded-xl border-2 border-dashed transition cursor-pointer p-8 text-center ${
                            dragActive
                                ? 'border-ink-900 bg-ink-900/5'
                                : 'border-ink-900/15 hover:border-ink-900/40'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-ink-900/5 flex items-center justify-center text-ink-900/60">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <p className="font-semibold">
                                {pagePreviews.length > 0
                                    ? `${pagePreviews.length} imagen${pagePreviews.length > 1 ? 'es' : ''} seleccionada${pagePreviews.length > 1 ? 's' : ''}`
                                    : 'Arrastra imágenes aquí o haz clic para seleccionar'}
                            </p>
                            <p className="text-xs text-ink-900/50">
                                JPG o PNG · Varias a la vez · Máx 8MB cada una
                            </p>
                        </div>
                    </div>
                    <input
                        ref={pagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handlePagesSelect(e.target.files)}
                    />
                    {pagesForm.errors['images.0'] && (
                        <p className="mt-2 text-xs text-red-600">{pagesForm.errors['images.0']}</p>
                    )}

                    {pagePreviews.length > 0 && (
                        <>
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                {pagePreviews.map((src, i) => (
                                    <div key={i} className="aspect-[3/4] rounded-md overflow-hidden border border-ink-900/10">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        pagesForm.setData('images', []);
                                        setPagePreviews([]);
                                        if (pagesInputRef.current) pagesInputRef.current.value = '';
                                    }}
                                    className="text-sm font-semibold px-4 py-2 rounded-lg border border-ink-900/15 hover:bg-ink-900/5 transition"
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="submit"
                                    disabled={pagesForm.processing}
                                    className="bg-ink-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-ink-700 transition disabled:opacity-50"
                                >
                                    {pagesForm.processing ? 'Subiendo…' : `Subir ${pagePreviews.length} página${pagePreviews.length > 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {/* Existing pages */}
                {magazine.pages.length > 0 ? (
                    <div className="pt-4 border-t border-ink-900/5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {magazine.pages.map((p, i) => (
                                <div
                                    key={p.id}
                                    className="group relative border border-ink-900/10 rounded-lg overflow-hidden hover:shadow-md transition"
                                >
                                    <div className="aspect-[3/4] bg-ink-900/5">
                                        <img
                                            src={resolveImage(p.image)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute top-1.5 left-1.5 bg-ink-900/80 text-white text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full backdrop-blur">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/50 transition flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => deletePage(p.id)}
                                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                            aria-label="Eliminar"
                                            title="Eliminar"
                                        >
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="pt-4 border-t border-ink-900/5 text-center py-8 text-ink-900/50 text-sm">
                        Aún no hay páginas. Sube la primera arriba.
                    </div>
                )}
            </Card>
        </AdminLayout>
    );
}
