import { Storage } from '@plasmohq/storage';

import { sha256_hash } from '~lib/utils/hash';
import { same } from '~lib/utils/same';

interface CryptoOptions {
    algorithm: 'PBKDF2';
    hash_algo: 'SHA-256';
    cipher_mode: 'AES-GCM';
    cipher_size: 256;

    iterations: number;
    salt_size: number;
    iv_size: number;
}

const is_weaker_options = (_options: CryptoOptions, options: CryptoOptions): boolean => {
    return (
        _options.iterations < options.iterations ||
        _options.salt_size < options.salt_size ||
        _options.iv_size < options.iv_size
    );
};

export const DEFAULT_CRYPTO_OPTIONS: CryptoOptions = {
    algorithm: 'PBKDF2',
    hash_algo: 'SHA-256',
    cipher_mode: 'AES-GCM',
    cipher_size: 256,

    iterations: 1000_000, // note spend time
    salt_size: 32,
    iv_size: 32,
};

interface WrappedData {
    encrypted: string;
    options: CryptoOptions;
}

export const DEFAULT_NS_SEPARATOR = '|:|';

// Each data set has its own options
export class FuseSecureStorage<T> {
    #encoder = new TextEncoder();
    #decoder = new TextDecoder();

    private key_namespace: string;
    private passwordKey: CryptoKey | undefined;
    private data: T | undefined;
    constructor(
        private storage: Storage,
        private key: string,
        private options: CryptoOptions = DEFAULT_CRYPTO_OPTIONS,
        private namespace = '',
        private separator: string = DEFAULT_NS_SEPARATOR,
    ) {
        this.key_namespace = '';
    }

    public async restore(password: string): Promise<boolean> {
        if (!password) throw new Error('invalid password');

        const s = Date.now();

        if (!this.namespace) this.namespace = (await sha256_hash(`SHA-256#${password}`)).slice(-16);
        this.key_namespace = `${this.namespace}${this.separator}`;

        const namespace_key = `${this.key_namespace}${this.key}`;
        const wrapped_data = await this.storage.get<WrappedData>(namespace_key);
        const { encrypted, options: _options } = wrapped_data ?? { options: this.options };

        const passwordBuffer = this.#encoder.encode(password);
        this.passwordKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: _options.algorithm },
            false, // Not exportable
            ['deriveKey'],
        );
        let verified = false;
        if (encrypted) {
            try {
                const json = await this.#decrypt(this.passwordKey, encrypted);
                this.data = JSON.parse(json);
                verified = true;
            } catch (e) {
                console.error(`wrong password`, e);
            }
        }

        if (!same(this.options, _options)) {
            if (is_weaker_options(_options, this.options)) {
                await this.#persist(this.passwordKey, this.data); // persist by stronger options
            } else {
                this.options = _options; // use read options
            }
        }

        const e = Date.now();
        console.debug(`restore secure storage spend: ${e - s}ms`, this.key, 'has value ->', !!this.data);

        return verified;
    }

    #persist = async (passwordKey: CryptoKey, data: T | undefined) => {
        const namespace_key = `${this.key_namespace}${this.key}`;

        if (data === undefined) {
            await this.storage.remove(namespace_key);
            return;
        }

        const json = JSON.stringify(data);
        const encrypted = await this.#encrypt(passwordKey, json);
        const item: WrappedData = { encrypted, options: this.options };
        await this.storage.set(namespace_key, item);
    };

    #decrypt = async (passwordKey: CryptoKey, encrypted: string) => {
        const boxBuffer = base64ToU8(encrypted);

        const prefix_size = this.options.salt_size + this.options.iv_size;
        const salt = boxBuffer.slice(0, this.options.salt_size);
        const iv = boxBuffer.slice(this.options.salt_size, prefix_size);
        const encryptedDataBuffer = boxBuffer.slice(prefix_size);
        const aesKey = await deriveKey(this.options, passwordKey, salt, ['decrypt']);

        const decryptedDataBuffer = await crypto.subtle.decrypt(
            {
                name: this.options.cipher_mode,
                iv,
            },
            aesKey,
            encryptedDataBuffer,
        );
        return this.#decoder.decode(decryptedDataBuffer);
    };

    #encrypt = async (passwordKey: CryptoKey, decrypted: string) => {
        const salt = crypto.getRandomValues(new Uint8Array(this.options.salt_size));
        const iv = crypto.getRandomValues(new Uint8Array(this.options.iv_size));
        const aesKey = await deriveKey(this.options, passwordKey, salt, ['encrypt']);

        const encryptedDataBuffer = new Uint8Array(
            await crypto.subtle.encrypt(
                {
                    name: this.options.cipher_mode,
                    iv,
                },
                aesKey,
                this.#encoder.encode(decrypted),
            ),
        );

        const prefix_size = this.options.salt_size + this.options.iv_size;

        const boxBuffer = new Uint8Array(prefix_size + encryptedDataBuffer.byteLength);

        boxBuffer.set(salt, 0);
        boxBuffer.set(iv, this.options.salt_size);
        boxBuffer.set(encryptedDataBuffer, prefix_size);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const boxBase64 = u8ToBase64(boxBuffer as any);
        return boxBase64;
    };

    public async get(): Promise<T | undefined> {
        if (this.passwordKey === undefined) throw new Error('Password not set, please first call restore.');
        return this.data;
    }

    public async set(data: T): Promise<void> {
        if (this.passwordKey === undefined) throw new Error('Password not set, please first call restore.');

        if (same(data, this.data)) return;

        await this.#persist(this.passwordKey, data);
        this.data = data;
    }

    public async remove(): Promise<void> {
        if (this.passwordKey === undefined) throw new Error('Password not set, please first call restore.');

        await this.#persist(this.passwordKey, undefined);
        this.data = undefined;
    }
}

// ============================ utils ============================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const u8ToBase64 = (a: ArrayBufferLike) => globalThis.btoa(String.fromCharCode.apply(null, a as any));
const base64ToU8 = (base64: string) => Uint8Array.from(globalThis.atob(base64), (c) => c.charCodeAt(0));

const { crypto } = globalThis;

const deriveKey = async (options: CryptoOptions, passwordKey: CryptoKey, salt: Uint8Array, keyUsage: KeyUsage[]) => {
    const s = Date.now();
    const key = crypto.subtle.deriveKey(
        {
            name: options.algorithm,
            hash: options.hash_algo,
            salt,
            iterations: options.iterations,
        },
        passwordKey,
        {
            name: options.cipher_mode,
            length: options.cipher_size,
        },
        false,
        keyUsage,
    );
    const e = Date.now();
    console.debug(`derive key spend: ${e - s}ms`);
    return key;
};
