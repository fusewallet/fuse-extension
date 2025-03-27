import { useCallback, useState } from 'react';
import { useNavigate, type NavigateFunction, type NavigateOptions } from 'react-router-dom';

export type GotoFunction = (path: string | number, options?: NavigateOptions) => void;

export const useGoto = (): {
    setHide: (v: { hide?: () => Promise<void> }) => void;
    goto: GotoFunction;
    navigate: NavigateFunction;
} => {
    const navigate = useNavigate();

    const [hide, setHide] = useState<{ hide?: () => Promise<void> }>({});

    const goto = useCallback(
        (path: string | number, options?: NavigateOptions) => {
            const go = () => {
                if (typeof path === 'number') return navigate(path);
                return navigate(path, options);
            };
            if (!hide?.hide) return go();
            hide.hide().then(() => go());
        },
        [navigate, hide],
    );

    return {
        setHide,
        goto,
        navigate,
    };
};
