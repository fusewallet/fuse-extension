import { get_cached_data } from '~hooks/store/local';
import { match_combined_token_info, type CombinedTokenInfo } from '~types/tokens';
import { get_token_logo_key } from '~types/tokens/preset';
import { PRESET_LOGO_IC } from '~types/tokens/preset/ic';
import { PRESET_LOGO_POLYGON } from '~types/tokens/preset/polygon';

// evm token logo
const get_token_logo_from_covalent = (address: string, chainId: number): string => {
    return `https://logos.covalenthq.com/tokens/${chainId}/${address.toLowerCase()}.png`;
};

// FIXME move to hooks
export const get_token_logo = async (info: CombinedTokenInfo): Promise<string | undefined> => {
    const preset = match_combined_token_info(info, {
        ic: (ic) => PRESET_LOGO_IC[`ic#${ic.canister_id}`],
        ethereum: (ethereum) => get_token_logo_from_covalent(ethereum.address, 1),
        ethereum_test_sepolia: (ethereum_test_sepolia) =>
            get_token_logo_from_covalent(ethereum_test_sepolia.address, 11155111),
        polygon: (polygon) =>
            PRESET_LOGO_POLYGON[polygon.address] ?? get_token_logo_from_covalent(polygon.address, 137),
        polygon_test_amoy: (polygon_test_amoy) => get_token_logo_from_covalent(polygon_test_amoy.address, 80001),
        bsc: (bsc) => get_token_logo_from_covalent(bsc.address, 56),
        bsc_test: (bsc_test) => get_token_logo_from_covalent(bsc_test.address, 97),
    });
    if (preset) return preset;
    const key = get_token_logo_key(info);
    return get_cached_data(key, async () => undefined, 1000 * 60 * 60 * 24 * 365 * 100);
};
