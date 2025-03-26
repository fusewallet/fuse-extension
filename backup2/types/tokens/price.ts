import type { TokenUniqueId } from '.';

export interface ShowTokenPrice {
    price?: string;
    price_change_24h?: string;
}

export type TokenPrices = Record<TokenUniqueId, ShowTokenPrice>;
