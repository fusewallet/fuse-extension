import { principal2account } from '@choptop/haw';
import type { SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import * as bip39 from 'bip39';
import { HDKey } from 'ethereum-cryptography/hdkey.js';
import { keccak256 } from 'ethereum-cryptography/keccak';
import _ from 'lodash';
// import hdkey from 'hdkey';
import * as secp256k1 from 'secp256k1';
import { bytesToHex, getAddress as getEvmAddress } from 'viem';

import type { IdentityAddress } from '~types/identity';
import type { MnemonicParsed } from '~types/keys/mnemonic';

export const random_mnemonic = (words: 12 | 24) => {
    let mnemonic = bip39.generateMnemonic(words === 12 ? 128 : 256);
    while (!validate_mnemonic(mnemonic) || _.uniq(mnemonic.split(' ')).length < mnemonic.split(' ').length) {
        mnemonic = bip39.generateMnemonic(words === 12 ? 128 : 256);
    }
    return mnemonic;
};

export const validate_mnemonic = (mnemonic: string) => bip39.validateMnemonic(mnemonic);

export const get_address_by_mnemonic_and_metadata = (
    mnemonic: string,
    subaccount = 0,
    parsed?: MnemonicParsed,
): [
    IdentityAddress,
    {
        ic?: SignIdentity;
        ethereum?: { privateKey: `0x${string}` };
        ethereum_test_sepolia?: { privateKey: `0x${string}` };
        polygon?: { privateKey: `0x${string}` };
        polygon_test_amoy?: { privateKey: `0x${string}` };
        bsc?: { privateKey: `0x${string}` };
        bsc_test?: { privateKey: `0x${string}` };
    },
] => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // const root = hdkey.fromMasterSeed(seed); // ? always failed by assert is not a function
    const root = HDKey.fromMasterSeed(seed);

    // ic
    const [ic, ic_identity] = (() => {
        const { privateKey } = root.derive(`m/44'/223'/0'/0/${subaccount}`);
        const publicKey = secp256k1.publicKeyCreate(new Uint8Array(privateKey ?? []), false);

        const publicKeyArray = new Uint8Array(publicKey).buffer;
        const privateKeyArray = new Uint8Array(privateKey ?? []).buffer;

        const identity =
            parsed?.ic === 'ed25519'
                ? Ed25519KeyIdentity.fromKeyPair(publicKeyArray, privateKeyArray)
                : Secp256k1KeyIdentity.fromKeyPair(publicKeyArray, privateKeyArray); // default secp256k

        const owner = identity.getPrincipal().toText();
        const account_id = principal2account(owner);
        return [{ owner, account_id }, identity];
    })();
    // ethereum default
    const [default_ethereum, default_ethereum_keys] = (() => {
        // Use Ethereum standard derivation path m/44'/60'/0'/0/index
        const { privateKey } = root.derive(`m/44'/60'/0'/0/${subaccount}`);
        const privateBytes = new Uint8Array(privateKey ?? []);
        // Generate public key from private key
        const publicKey = secp256k1.publicKeyCreate(privateBytes, false);

        // Generate Ethereum address from public key
        // Remove the first byte (0x04) from the public key, then calculate keccak256 hash
        const publicKeyWithoutPrefix = Buffer.from(publicKey.slice(1));
        const addressBuffer = keccak256(publicKeyWithoutPrefix).slice(-20);

        // Convert to checksum address format (EIP-55)
        const checksumAddress = getEvmAddress(`0x${Buffer.from(addressBuffer).toString('hex')}`);

        return [{ address: checksumAddress }, { privateKey: bytesToHex(privateBytes) }];
    })();

    return [
        {
            ic,
            ethereum: default_ethereum,
            ethereum_test_sepolia: default_ethereum,
            polygon: default_ethereum,
            polygon_test_amoy: default_ethereum,
            bsc: default_ethereum,
            bsc_test: default_ethereum,
        },
        {
            ic: ic_identity,
            ethereum: default_ethereum_keys,
            ethereum_test_sepolia: default_ethereum_keys,
            polygon: default_ethereum_keys,
            polygon_test_amoy: default_ethereum_keys,
            bsc: default_ethereum_keys,
            bsc_test: default_ethereum_keys,
        },
    ];
};

export const get_address_by_mnemonic = (
    mnemonic: string,
    subaccount: number,
    parsed?: MnemonicParsed,
): IdentityAddress => get_address_by_mnemonic_and_metadata(mnemonic, subaccount, parsed)[0];

const get_all_mnemonic_words = () => bip39.wordlists.english; // cspell: disable-line

export const pick_word_exclude_appeared = (appeared: string[]): string => {
    const words = get_all_mnemonic_words();
    const filtered = words.filter((word) => !appeared.includes(word));
    return filtered[Math.floor(Math.random() * filtered.length)];
};
