export interface MnemonicParsed {
    // icp
    ic?: 'secp256k' | 'ed25519';
    // eth
    ethereum?: undefined;
    ethereum_test_sepolia?: undefined;
    // polygon
    polygon?: undefined;
    polygon_test_amoy?: undefined;
    // bsc
    bsc?: undefined;
    bsc_test?: undefined;
}

export interface IdentityKeyMnemonic {
    type: 'mnemonic';
    mnemonic: string;
    subaccount: number;
    parsed?: MnemonicParsed; // how to parse
}
