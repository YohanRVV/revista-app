<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Magazine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MagazineController extends Controller
{
    public function index(): Response
    {
        $magazines = Magazine::query()
            ->withCount('pages')
            ->latest()
            ->get();

        return Inertia::render('Admin/Magazines/Index', [
            'magazines' => $magazines,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Magazines/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'issue' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'is_published' => ['boolean'],
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        $data['is_published'] = (bool) ($data['is_published'] ?? false);
        $data['published_at'] = $data['is_published'] ? now() : null;

        $magazine = Magazine::create($data);

        return redirect()->route('admin.magazines.edit', $magazine)
            ->with('success', 'Revista creada. Ahora puedes agregar páginas.');
    }

    public function edit(Magazine $magazine): Response
    {
        $magazine->load('pages');

        return Inertia::render('Admin/Magazines/Edit', [
            'magazine' => $magazine,
        ]);
    }

    public function update(Request $request, Magazine $magazine): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'issue' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'is_published' => ['boolean'],
        ]);

        if ($request->hasFile('cover_image')) {
            if ($magazine->cover_image) {
                Storage::disk('public')->delete($magazine->cover_image);
            }
            $data['cover_image'] = $request->file('cover_image')->store('covers', 'public');
        }

        $willPublish = (bool) ($data['is_published'] ?? false);
        $data['is_published'] = $willPublish;

        if ($willPublish && ! $magazine->published_at) {
            $data['published_at'] = now();
        }
        if (! $willPublish) {
            $data['published_at'] = null;
        }

        $magazine->update($data);

        return back()->with('success', 'Revista actualizada.');
    }

    public function destroy(Magazine $magazine): RedirectResponse
    {
        foreach ($magazine->pages as $page) {
            Storage::disk('public')->delete($page->image);
        }
        if ($magazine->cover_image) {
            Storage::disk('public')->delete($magazine->cover_image);
        }

        $magazine->delete();

        return redirect()->route('admin.magazines.index')
            ->with('success', 'Revista eliminada.');
    }
}
