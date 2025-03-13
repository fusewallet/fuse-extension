import ArrowDown from 'data-base64:~assets/svg/common/arrow-down.svg';
import { useNavigate } from 'react-router-dom';

import { useIdentityKeys } from '~hooks/store/local-secure';
import { get_chain_network_logo } from '~types/network';

export const ChainSelector = () => {
    const navigate = useNavigate();
    const { current_chain_network } = useIdentityKeys();
    return (
        <div
            className="flex h-6 w-[42px] flex-shrink-0 cursor-pointer items-center justify-between rounded-[25px] bg-[#333] p-[3px] pr-[7px]"
            onClick={() => navigate('/home/chains')}
        >
            <img
                src={
                    current_chain_network && get_chain_network_logo(current_chain_network.chain, current_chain_network)
                }
                className="h-[18px] w-[18px]"
                alt="IC"
            />
            <img src={ArrowDown} alt="ArrowDown" />
        </div>
    );
};
