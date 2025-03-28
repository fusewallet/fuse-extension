import { sha256_hash } from '~lib/utils/hash';

const CACHED_PASSWORD_KEY: Record<string, CryptoKey> = {};

export const getCachedPasswordKey = async (password: string, algorithm: string) => {
    const key = await sha256_hash(`SHA-256#${password}#${algorithm}`);
    let cached = CACHED_PASSWORD_KEY[key];
    if (cached) return cached;

    const s = Date.now();

    const passwordBuffer = new TextEncoder().encode(password);

    cached = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: algorithm },
        false, // Not exportable
        ['deriveKey'],
    );
    CACHED_PASSWORD_KEY[key] = cached;

    const e = Date.now();
    if (10 < e - s) console.warn(`get new passwordKey spend: ${e - s}ms`);

    return cached;
};
