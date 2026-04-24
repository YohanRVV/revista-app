<?php

namespace Database\Seeders;

use App\Models\Magazine;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@revista.test',
            'password' => bcrypt('password'),
        ]);

        $magazine = Magazine::create([
            'title' => 'Revista Demo · Edición Inaugural',
            'slug' => 'revista-demo-inaugural',
            'issue' => 'Vol. 01 · Abril 2026',
            'description' => 'Esta es una edición demo generada automáticamente para mostrar el visor de revistas con efecto de hojeo.',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $demoPages = [
            ['https://picsum.photos/seed/cover/800/1100', 'Portada'],
            ['https://picsum.photos/seed/editorial/800/1100', 'Editorial'],
            ['https://picsum.photos/seed/indice/800/1100', 'Índice'],
            ['https://picsum.photos/seed/art1/800/1100', 'Artículo principal'],
            ['https://picsum.photos/seed/art2/800/1100', 'Reportaje'],
            ['https://picsum.photos/seed/art3/800/1100', 'Entrevista'],
            ['https://picsum.photos/seed/art4/800/1100', 'Galería'],
            ['https://picsum.photos/seed/contraportada/800/1100', 'Contraportada'],
        ];

        foreach ($demoPages as $index => [$url, $caption]) {
            $magazine->pages()->create([
                'order' => $index + 1,
                'image' => $url,
                'caption' => $caption,
            ]);
        }
    }
}
