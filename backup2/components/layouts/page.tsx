import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useNavigatePages } from '~hooks/navigate';
import { useTokenInfoIcByRefreshing, useTokenPriceIcByRefreshing } from '~hooks/store/local';
import { usePathname } from '~hooks/store/session';
import { CurrentState } from '~types/state';

export const FusePage = ({
    current_state,
    states = CurrentState.ALIVE,
    replace = false,
    children,
    options,
}: {
    current_state: CurrentState;
    states?: CurrentState | CurrentState[] | null;
    replace?: boolean; // can go back or not
    children: React.ReactNode;
    options?: {
        update_pathname?: boolean;
        refresh_token_info_ic_sleep?: number;
        refresh_token_price_ic_sleep?: number;
    };
}) => {
    useNavigatePages(current_state, replace); // ! always check state and page

    // refresh data
    useTokenInfoIcByRefreshing(options?.refresh_token_info_ic_sleep ?? 0);
    useTokenPriceIcByRefreshing(options?.refresh_token_price_ic_sleep ?? 0);

    const location = useLocation();
    const [, setPathname] = usePathname();
    useEffect(() => {
        if (!options?.update_pathname) return;
        const path = location.pathname;
        setPathname(path);
    }, [options, location, setPathname]);

    if (states !== undefined && states !== null) {
        if (Array.isArray(states)) {
            if (!states.includes(current_state)) {
                return <></>;
            }
        } else if (current_state !== states) {
            return <></>;
        }
    }
    return <>{children}</>;
};
