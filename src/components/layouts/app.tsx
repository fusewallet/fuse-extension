import { HeroUIProvider } from '@heroui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HashRouter, useRoutes, type RouteObject } from 'react-router-dom';
import VConsole from 'vconsole';

import logo_black from '~assets/svg/logo-black.svg';
import Icon from '~components/icon';

import '~index.css';
import '~assets/styles/globals.css';
import '~assets/iconfont/iconfont.js';

import { useEffect } from 'react';

import { Toaster } from '~components/ui/sonner';
import { is_development } from '~lib/utils/env';
// FIXME refactor
// import { useBackground } from '~hooks/memo/background';
import type { WindowType } from '~types/window';

// FIXME refactor
// import { ReactQueryProvider } from './provider';
// import { useWatchCurrentIdentity } from '~hooks/memo/identity';

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
        if (is_development() && wt !== 'options') v_console = new VConsole();
        return () => v_console?.destroy();
    }, [wt]);
    return (
        <QueryClientProvider client={new QueryClient()}>
        <HashRouter>
            <HeroUIProvider>
                <WrapOptionPage className={className} routes={routes} wt={wt} />
                <Toaster position="top-center" theme="dark" />
                    {is_development() && <ReactQueryDevtools />}
            </HeroUIProvider>
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
    // FIXME refactor
    // useBackground();
    // useWatchCurrentIdentity();
    const views = useRoutes(routes);
    return <>{views}</>;
};
