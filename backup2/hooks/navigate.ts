import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { CurrentState } from '~types/state';

export const useNavigatePages = (current_state: CurrentState, replace = true) => {
    const navigate = useNavigate();
    const location = useLocation();
    // console.debug(`🚀 ~ useNavigatePages ~ location:`, location);

    useEffect(() => {
        const route: string | undefined = (() => {
            switch (current_state) {
                case CurrentState.WELCOME:
                    return '/welcome';
                case CurrentState.INITIAL:
                    return '/initial';
                case CurrentState.ALIVE:
                    return '/home';
                case CurrentState.LOCKED:
                    return '/locked';
                case CurrentState.ACTION:
                    return '/action';
            }
            return undefined;
        })();
        if (route) {
            const pathname = location.pathname;
            // console.debug(`🚀 ~ useEffect ~ pathname:`, pathname, route);
            if (route === '/home' && pathname === '/locked') {
                console.debug("go back to home'page from", pathname);
                navigate(-1);
            } else if (route === '/locked' && pathname === '/initial/restore') {
                // pass
            } else if (route === '/home' && ['/', '/home'].includes(pathname)) {
                // pass
            } else if (route === '/home' && pathname.startsWith('/home/')) {
                // pass
            } else if (route === '/home' && !['/', '/home'].includes(pathname)) {
                console.debug('go', pathname, '->', '/');
                navigate('/', { replace });
            } else if (!pathname.startsWith(route)) {
                console.debug('go', pathname, '->', route);
                navigate(route, { replace });
            }
        }
    }, [navigate, location, current_state, replace]);
};
