<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Forzar HTTPS cuando estamos en producción detrás de un proxy
        // que termina SSL (Render, InfinityFree con SSL activado, etc.)
        if (config('app.force_https') || $this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
