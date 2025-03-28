import Fuse from 'fuse.js';
import { throttle } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import Icon from '~components/icon';
import { FusePage } from '~components/layouts/page';
import { FusePageTransition } from '~components/layouts/transition';
import { useCurrentState } from '~hooks/memo/current_state';
import { useGoto } from '~hooks/memo/goto';
import { useCurrentTokensShowInfo } from '~hooks/store/local/token';
import { FunctionHeader } from '~pages/functions/components/header';
import { TokenCard } from '~pages/home/components/show-token';
import { get_token_unique_id } from '~types/tokens';

enum TransferType {
    TRANSFER = 'transfer',
    RECEIVE = 'receive',
    DETAILS = 'details',
}

function FunctionTransferPage() {
    const { type = TransferType.DETAILS } = useParams<{ type: TransferType }>();

    const current_state = useCurrentState();

    const { setHide, goto: _goto, navigate } = useGoto();

    const [search, setSearch] = useState('');

    const { tokens_info } = useCurrentTokensShowInfo();

    const throttledSearch = useMemo(
        () =>
            throttle((value: string) => {
                setSearch(value);
            }, 300),
        [],
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        throttledSearch(e.target.value);
    }, []);

    useEffect(() => {
        return () => {
            throttledSearch.cancel();
        };
    }, []);

    const fuse = useMemo(() => {
        return new Fuse(tokens_info, {
            keys: [
                'token.info.ic.canister_id',
                'token.info.ic.name',
                'token.info.ic.symbol',
                'token.info.ethereum.address',
                'token.info.ethereum.name',
                'token.info.ethereum.symbol',
                'token.info.ethereum_test_sepolia.address',
                'token.info.ethereum_test_sepolia.name',
                'token.info.ethereum_test_sepolia.symbol',
                'token.info.polygon.address',
                'token.info.polygon.name',
                'token.info.polygon.symbol',
                'token.info.polygon_test_amoy.address',
                'token.info.polygon_test_amoy.name',
                'token.info.polygon_test_amoy.symbol',
                'token.info.bsc.address',
                'token.info.bsc.name',
                'token.info.bsc.symbol',
                'token.info.bsc_test.address',
                'token.info.bsc_test.name',
                'token.info.bsc_test.symbol',
            ],
            threshold: 0.3,
            ignoreLocation: true,
        });
    }, [tokens_info]);

    const filteredTokens = useMemo(() => {
        if (!search.trim()) return tokens_info;
        return fuse.search(search).map((result) => result.item);
    }, [search, fuse]);

    return (
        <FusePage current_state={current_state} options={{ refresh_token_info_ic_sleep: 1000 * 60 * 10 }}>
            <FusePageTransition setHide={setHide}>
                <div className="relative flex h-full w-full flex-col items-center justify-start pt-[52px]">
                    <FunctionHeader title={'Select'} onBack={() => _goto('/')} onClose={() => _goto('/')} />

                    <div className="w-full px-5">
                        <div className="flex h-12 w-full items-center rounded-xl border border-[#333333] px-3 transition duration-300 hover:border-[#FFCF13]">
                            <Icon name="icon-search" className="h-[16px] w-[16px] text-[#999999]" />
                            <input
                                type="text"
                                className="h-full w-full border-transparent bg-transparent pl-3 text-base outline-none placeholder:text-sm"
                                placeholder="Search token"
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    <div className="flex w-full flex-1 flex-col gap-y-[10px] overflow-y-auto px-5 py-3">
                        {filteredTokens.map((info) => (
                            <TokenCard
                                key={get_token_unique_id(info.token)}
                                goto={(path, options) =>
                                    typeof path === 'number' ? navigate(path) : navigate(path, options)
                                }
                                info={info}
                                type={type}
                            />
                        ))}
                    </div>
                </div>
            </FusePageTransition>
        </FusePage>
    );
}

export default FunctionTransferPage;
