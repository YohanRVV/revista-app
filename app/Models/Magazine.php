<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Magazine extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'issue',
        'description',
        'cover_image',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Magazine $magazine) {
            if (empty($magazine->slug)) {
                $magazine->slug = Str::slug($magazine->title) . '-' . Str::random(6);
            }
        });
    }

    public function pages(): HasMany
    {
        return $this->hasMany(MagazinePage::class)->orderBy('order');
    }
}
