FROM php:8.3-cli-bookworm

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        ca-certificates \
        zip \
        unzip \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        libpq-dev \
        libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install \
        pdo_mysql \
        pdo_pgsql \
        pdo_sqlite \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip

# Node 20 (for Vite build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Cache composer deps
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

# Cache npm deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --legacy-peer-deps

# Copy app
COPY . .

# Finalize composer + build assets
RUN composer dump-autoload --no-dev --optimize \
    && npm run build \
    && rm -rf node_modules

# Permissions
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8080

# Migrate, link storage, cache, then serve via PHP built-in
CMD php artisan migrate --force \
    && (php artisan storage:link || true) \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php -S 0.0.0.0:${PORT:-8080} -t public
