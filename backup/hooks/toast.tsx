import { addToast, type ToastProps } from '@heroui/react';
import { useCallback } from 'react';
import { toast as sonner_toast } from 'sonner';

import error_svg from '~assets/svg/tips/error.min.svg';
import info_svg from '~assets/svg/tips/info.min.svg';
import success_svg from '~assets/svg/tips/success.min.svg';
import { cn } from '~lib/utils/cn';
import type { WindowType } from '~types/pages';

// <ToastProvider placement="top-center" toastProps={{ classNames: HERO_TOAST_CLASS_NAMES(wt) }} />
export const HERO_TOAST_CLASS_NAMES = (wt?: WindowType) => ({
    base: cn('base-classes', wt === 'options' ? 'options' : ''),
    content: 'content-classes',
    description: 'description-classes',
    title: 'title-classes',
    loadingIcon: 'loading-icon-classes',
    icon: 'icon-classes',
    progressTrack: 'progress-track-classes',
    progressIndicator: 'progress-indicator-classes',
    closeButton: 'closeButton-classes',
    closeIcon: 'closeIcon-classes',
});

// ! ERROR: require(...).then() is not a function
// @heroui/toast/dist/chunk-UPFXK3G4.mjs // cspell: disable-line
// var loadFeatures = () => import("framer-motion").then((res) => res.domMax); // ! can not import in plasmo framework
export const useHeroToast = () => {
    const toast = useCallback(
        (title: string | ToastProps, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
            if (typeof title === 'string') {
                addToast({
                    title: (
                        <span
                            className={`text-[${type === 'success' ? '#00C431' : type === 'error' ? '#FF2C40' : '#FFCF13'}]`}
                        >
                            {title}
                        </span>
                    ),
                    icon: <img src={type === 'success' ? success_svg : type === 'error' ? error_svg : info_svg} />,
                    timeout: duration,
                });
            } else {
                addToast({
                    timeout: duration,
                    ...title,
                });
            }
        },
        [],
    );
    return toast;
};

export const useSonnerToast = (): typeof sonner_toast => {
    return sonner_toast;
};
