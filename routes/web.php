<?php

use App\Http\Controllers\Admin\MagazineController as AdminMagazineController;
use App\Http\Controllers\Admin\MagazinePageController as AdminMagazinePageController;
use App\Http\Controllers\MagazineController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MagazineController::class, 'index'])->name('home');
Route::get('/revista/{magazine:slug}', [MagazineController::class, 'show'])->name('magazines.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('/dashboard', '/admin/magazines')->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('magazines', AdminMagazineController::class)->except(['show']);

        Route::post('magazines/{magazine}/pages', [AdminMagazinePageController::class, 'store'])
            ->name('magazines.pages.store');
        Route::put('magazines/{magazine}/pages/reorder', [AdminMagazinePageController::class, 'reorder'])
            ->name('magazines.pages.reorder');
        Route::delete('magazines/{magazine}/pages/{page}', [AdminMagazinePageController::class, 'destroy'])
            ->name('magazines.pages.destroy');
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
