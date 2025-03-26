// import { HeroUIProvider } from '@heroui/system';
import { QueryClientProvider } from '@tanstack/react-query';

import '~index.css';
import '~assets/styles/reset.css';
import '~assets/styles/globals.css';
import '~assets/styles/animation.css';
import '~assets/iconfont/iconfont.js';

import { lazy, useEffect } from 'react';
import { HashRouter, useRoutes, type RouteObject } from 'react-router-dom';
import type VConsole from 'vconsole';

import logo_black from '~assets/svg/logo-black.svg';
import Icon from '~components/icon';
import { Toaster } from '~components/ui/sonner';
// import { useBackground } from '~hooks/memo/background';
import { queryClient } from '~lib/react-query';
import { is_development } from '~lib/utils/env';
import type { WindowType } from '~types/window';

// FIXME refactor
// import { useWatchCurrentIdentity } from '~hooks/memo/identity';

const ReactQueryDevtools = lazy(() => import('./devtools'));

export const SinglePageApp = ({
    className,
    routes,
    wt,
}: {
    className?: string;
    routes: RouteObject[];
    wt?: WindowType;
}) => {
    useEffect(() => {
        let v_console: VConsole | undefined = undefined;
        if (is_development() && wt !== 'options') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            import('vconsole').then((v: any) => (v_console = new v()));
        }
        return () => v_console?.destroy();
    }, [wt]);
    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                {/* <HeroUIProvider> */}
                <WrapOptionPage className={className} routes={routes} wt={wt} />
                <Toaster position="top-center" theme="dark" />
                {is_development() && <ReactQueryDevtools initialIsOpen={false} buttonPosition={'bottom-left'} />}
                {/* </HeroUIProvider> */}
            </HashRouter>
        </QueryClientProvider>
    );
};

const WrapOptionPage = ({ className, routes, wt }: { className?: string; routes: RouteObject[]; wt?: WindowType }) => {
    return (
        <div className={className}>
            {wt === 'options' && (
                <div className="flex h-screen w-screen items-center justify-center bg-[#fef4ca]">
                    <div className="fixed left-0 top-6 flex w-full items-center justify-between px-10">
                        <img src={logo_black} className="mr-2 w-[120px]" />
                        <div className="flex items-center">
                            <Icon name="icon-tips" className="mr-1 h-4 w-4 text-[#333333]" />
                            <span className="text-base text-[#333333]">Help</span>
                        </div>
                    </div>
                    <div className="h-[640px] w-[400px] overflow-hidden rounded-2xl bg-[#0a0600] shadow-2xl">
                        <PageRoutes routes={routes} />
                    </div>
                </div>
            )}
            {wt !== 'options' && <PageRoutes routes={routes} />}
        </div>
    );
};

const PageRoutes = ({ routes }: { routes: RouteObject[] }) => {
    // useBackground();
    // FIXME refactor
    // useWatchCurrentIdentity();
    const views = useRoutes(routes);
    return <>{views}</>;
};
