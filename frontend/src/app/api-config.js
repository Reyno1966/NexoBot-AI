export function getApiUrl() {
    // Si estamos en el navegador, usa la variable pública
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
    // Si es servidor, usa la misma o fallback
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}
