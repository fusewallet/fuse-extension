import { HeroUIProvider } from '@heroui/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HashRouter, useRoutes, type RouteObject } from 'react-router-dom';

import logo_black from '~assets/svg/logo-black.svg';
import Icon from '~components/icon';

import '~index.css';
import '~styles/globals.css';
import '~assets/iconfont/iconfont.js';

import { Toaster } from '~components/ui/sonner';
import { useBackground } from '~hooks/memo/background';
import type { WindowType } from '~types/pages';

import { ReactQueryProvider } from './provider';

export const SinglePageApp = ({
    className,
    routes,
    wt,
}: {
    className?: string;
    routes: RouteObject[];
    wt?: WindowType;
}) => {
    return (
        <ReactQueryProvider>
            <HashRouter>
                <HeroUIProvider>
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
                    <Toaster position="top-center" theme="dark" />
                </HeroUIProvider>
                <ReactQueryDevtools />
            </HashRouter>
        </ReactQueryProvider>
    );
};

const PageRoutes = ({ routes }: { routes: RouteObject[] }) => {
    useBackground();
    const views = useRoutes(routes);
    return <>{views}</>;
};
