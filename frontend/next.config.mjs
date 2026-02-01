import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: true, // Forzamos desactivación para limpiar caché
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Forzamos Webpack para evitar el error de Turbopack en Railway
    webpack: (config) => {
        return config;
    },
    // Silenciamos el error de Turbopack poniéndolo SOLO en la raíz
    // como sugiere el mensaje de Next.js
    turbopack: {}
};

export default withPWA(nextConfig);
