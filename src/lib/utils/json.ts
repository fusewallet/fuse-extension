/* eslint-disable @typescript-eslint/no-explicit-any */
import { Principal } from '@dfinity/principal';
import BigNumber from 'bignumber.js';

const OPEN_TYPE = '__fuse_type__';

export const parse_factory = (
    upper_parse: (json: string, reviver?: (key: string | undefined, value: any) => any) => any,
): ((json: string, reviver?: (key: string | undefined, value: any) => any) => any) => {
    return (json: string, reviver?: (key: string | undefined, value: any) => any): any => {
        if (json === undefined) return reviver ? reviver(undefined, undefined) : undefined;

        if (typeof json !== 'string') throw new Error('json must be a string');
        return upper_parse(
            json,
            reviver ??
                ((_, v) => {
                    if (typeof v === 'object' && v !== null) {
                        const open_type = v[OPEN_TYPE];
                        switch (open_type) {
                            case 'bigint':
                                return BigInt(v.value);
                            case 'Uint8Array':
                                return new Uint8Array(v.value);
                            case 'Uint16Array':
                                return new Uint16Array(v.value);
                            case 'Uint32Array':
                                return new Uint32Array(v.value);
                            case 'BigUint64Array':
                                return new BigUint64Array(v.value.map((n: string) => BigInt(n)));
                            case 'Int8Array':
                                return new Int8Array(v.value);
                            case 'Int16Array':
                                return new Int16Array(v.value);
                            case 'Int32Array':
                                return new Int32Array(v.value);
                            case 'BigInt64Array':
                                return new BigInt64Array(v.value.map((n: string) => BigInt(n)));
                            case 'ArrayBuffer': {
                                const buffer = new ArrayBuffer(v.value.length);
                                const view = new DataView(buffer);
                                for (let i = 0; i < v.value.length; i++) view.setUint8(i, v.value[i]);
                                return buffer;
                            }
                            case 'BigNumber':
                                return new BigNumber(v.value);
                            case 'Principal':
                                return Principal.fromText(v.value);
                        }
                    }
                    return v;
                }),
        );
    };
};

const inner_replace_big_number = (v: any): any => {
    if (Array.isArray(v)) {
        for (let i = 0; i < v.length; i++) v[i] = inner_replace_big_number(v[i]);
    } else if (typeof v === 'object' && v !== null) {
        if (v['_isBigNumber']) {
            v = { [OPEN_TYPE]: 'BigNumber', value: v.toFixed() };
        } else {
            for (const k in v) v[k] = inner_replace_big_number(v[k]);
        }
    }
    return v;
};
export const stringify_factory = (
    upper_stringify: (
        value: any,
        replacer?: (key: string | undefined, value: any) => any,
        space?: string | number,
    ) => string,
    replace_big_number = false,
): ((value: any, replacer?: (key: string | undefined, value: any) => any, space?: string | number) => string) => {
    return (value: any, replacer?: (key: string | undefined, value: any) => any, space?: string | number): string => {
        if (replace_big_number) value = inner_replace_big_number(value); // JSON.stringify bug
        return upper_stringify(
            value,
            replacer ??
                ((_, v) => {
                    switch (typeof v) {
                        case 'bigint': {
                            return { [OPEN_TYPE]: 'bigint', value: `${v}` };
                        }
                        case 'object': {
                            if (v === null) break;
                            if (v instanceof Uint8Array) {
                                return { [OPEN_TYPE]: 'Uint8Array', value: Array.from(v) };
                            }
                            if (v instanceof Uint16Array) {
                                return { [OPEN_TYPE]: 'Uint16Array', value: Array.from(v) };
                            }
                            if (v instanceof Uint32Array) {
                                return { [OPEN_TYPE]: 'Uint32Array', value: Array.from(v) };
                            }
                            if (v instanceof BigUint64Array) {
                                return {
                                    [OPEN_TYPE]: 'BigUint64Array',
                                    value: Array.from(v).map((n) => `${n}`),
                                };
                            }
                            if (v instanceof Int8Array) {
                                return { [OPEN_TYPE]: 'Int8Array', value: Array.from(v) };
                            }
                            if (v instanceof Int16Array) {
                                return { [OPEN_TYPE]: 'Int16Array', value: Array.from(v) };
                            }
                            if (v instanceof Int32Array) {
                                return { [OPEN_TYPE]: 'Int32Array', value: Array.from(v) };
                            }
                            if (v instanceof BigInt64Array) {
                                return {
                                    [OPEN_TYPE]: 'BigInt64Array',
                                    value: Array.from(v).map((n) => `${n}`),
                                };
                            }
                            if (v instanceof ArrayBuffer) {
                                const buffer = v as ArrayBuffer;
                                const view = new DataView(buffer);
                                const value: number[] = [];
                                for (let i = 0; i < buffer.byteLength; i++) value.push(view.getUint8(i));
                                return { [OPEN_TYPE]: 'ArrayBuffer', value };
                            }
                            if (v['_isBigNumber']) {
                                return { [OPEN_TYPE]: 'BigNumber', value: v.toFixed() };
                            }
                            if (v['_arr'] && v['_isPrincipal']) {
                                return { [OPEN_TYPE]: 'Principal', value: v.toText() };
                            }
                            if (v['__principal__']) {
                                return { [OPEN_TYPE]: 'Principal', value: v['__principal__'] };
                            }
                            break;
                        }
                        case 'function': {
                            throw new Error(`can not stringify function`);
                        }
                    }
                    return v;
                }),
            space,
        );
    };
};
