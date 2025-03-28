import CHAIN_BSC_SVG from 'data-base64:~assets/svg/chains/bsc.min.svg';
import CHAIN_ETH_SVG from 'data-base64:~assets/svg/chains/eth.min.svg';
import CHAIN_IC_SVG from 'data-base64:~assets/svg/chains/ic.min.svg';
import CHAIN_POL_SVG from 'data-base64:~assets/svg/chains/pol.min.svg';
import { useEffect, useState } from 'react';

import { cn } from '~lib/utils/cn';
import type { Chain } from '~types/chain';
import type { TokenInfo } from '~types/tokens';
import { get_token_logo_by_address } from '~types/tokens/preset';

const TokenLogo = ({
    address,
    // token,
    chain,
    className,
}: {
    address: string;
    token?: TokenInfo;
    chain: Chain;
    className?: string;
}) => {
    const [logo, setLogo] = useState<string>();
    useEffect(() => {
        get_token_logo_by_address(address, chain).then(setLogo);
    }, [address, chain]);

    const getChainLogo = (chain: Chain) => {
        if (chain === 'ic') return CHAIN_IC_SVG;
        if (chain.indexOf('ethereum') >= 0) return CHAIN_ETH_SVG;
        if (chain.indexOf('pol') >= 0) return CHAIN_POL_SVG;
        if (chain.indexOf('bsc') >= 0) return CHAIN_BSC_SVG;
    };

    return (
        <div className={cn('relative', className)}>
            <img src={logo} className="h-10 w-10 rounded-full" />
            {chain && chain !== 'ic' && (
                <img
                    src={getChainLogo(chain)}
                    className="absolute bottom-0 right-0 h-4 w-4 rounded-full border border-black"
                />
            )}
        </div>
    );
};

export default TokenLogo;
