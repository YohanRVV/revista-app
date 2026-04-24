<?php

namespace App\Http\Controllers;

use App\Models\Magazine;
use Inertia\Inertia;
use Inertia\Response;

class MagazineController extends Controller
{
    public function index(): Response
    {
        $magazines = Magazine::query()
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->get(['id', 'title', 'slug', 'issue', 'description', 'cover_image', 'published_at']);

        return Inertia::render('Public/Home', [
            'magazines' => $magazines,
        ]);
    }

    public function show(Magazine $magazine): Response
    {
        abort_unless($magazine->is_published, 404);

        $magazine->load('pages');

        return Inertia::render('Public/Viewer', [
            'magazine' => $magazine,
        ]);
    }
}
