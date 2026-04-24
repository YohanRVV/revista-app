<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Magazine;
use App\Models\MagazinePage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MagazinePageController extends Controller
{
    public function store(Request $request, Magazine $magazine): RedirectResponse
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['image', 'max:8192'],
            'caption' => ['nullable', 'string', 'max:255'],
        ]);

        $nextOrder = (int) $magazine->pages()->max('order') + 1;

        foreach ($data['images'] as $image) {
            $path = $image->store("magazines/{$magazine->id}", 'public');
            $magazine->pages()->create([
                'order' => $nextOrder++,
                'image' => $path,
                'caption' => $data['caption'] ?? null,
            ]);
        }

        return back()->with('success', 'Páginas agregadas.');
    }

    public function reorder(Request $request, Magazine $magazine): RedirectResponse
    {
        $data = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:magazine_pages,id'],
        ]);

        foreach ($data['order'] as $index => $pageId) {
            MagazinePage::where('id', $pageId)
                ->where('magazine_id', $magazine->id)
                ->update(['order' => $index + 1]);
        }

        return back()->with('success', 'Orden actualizado.');
    }

    public function destroy(Magazine $magazine, MagazinePage $page): RedirectResponse
    {
        abort_if($page->magazine_id !== $magazine->id, 404);

        Storage::disk('public')->delete($page->image);
        $page->delete();

        return back()->with('success', 'Página eliminada.');
    }
}
