import { stringify_factory } from './json';

const stringify = stringify_factory(JSON.stringify);
export const same = <T>(a: T, b: T): boolean => {
    if (a === b) return true;

    const a_type = typeof a;
    const b_type = typeof b;

    if (a_type !== b_type) return false;

    if (a_type === 'object') {
        if (a === null || b === null) return a === b;

        if (Array.isArray(a)) {
            if (!Array.isArray(b)) return false;
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!same(a[i], b[i])) return false;
            }
            return true;
        }
        if (Array.isArray(b)) return false;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const a_keys = Object.keys(a as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b_keys = Object.keys(b as any);
        if (a_keys.length !== b_keys.length) return false;
        for (const key of a_keys) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!same((a as any)[key], (b as any)[key])) return false;
        }
        return true;

        // return stringify(a) === stringify(b); // note order
    }

    // already check ===
    if (a_type === 'undefined') return false;
    if (a_type === 'string') return false;
    if (a_type === 'boolean') return false;
    if (a_type === 'number') return (a as number) <= (b as number) && (a as number) >= (b as number);
    if (a_type === 'symbol') return false;

    return stringify(a) === stringify(b);
};
