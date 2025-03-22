import { useCallback } from 'react';

import type { Storage } from '@plasmohq/storage';

import { useCachedStoreData0, type DataMetadata0 } from '~hooks/meta/metadata-0';
import { is_same_popup_action, type PopupAction, type PopupActions } from '~types/actions';

import { SESSION_KEY_POPUP_ACTIONS } from '../keys';

// ! always try to use this value to avoid BLINK
type DataType = PopupActions;
const get_key = (): string => SESSION_KEY_POPUP_ACTIONS;
const get_default_value = (): DataType => [];
let cached_value = get_default_value();
const get_cached_value = (): DataType => cached_value;
const set_cached_value = (value: DataType): DataType => (cached_value = value);
const meta: DataMetadata0<DataType> = {
    get_key,
    get_default_value,
    get_cached_value,
    set_cached_value,
};

// popup actions -> // * session
export const usePopupActionsInner = (storage: Storage): [DataType, (value: DataType) => Promise<void>] =>
    useCachedStoreData0(storage, meta);

export const usePopupActionsInner2 = (
    storage: Storage,
): [
    PopupActions,
    {
        deletePopupAction: (action: PopupAction) => Promise<void>;
    },
] => {
    const [popup_actions, setPopupActions] = usePopupActionsInner(storage);

    const deletePopupAction = useCallback(
        async (action: PopupAction) => {
            console.error(`🚀 ~ deletePopupAction action:`, action);
            if (!popup_actions) return;
            const a = popup_actions.find((a) => is_same_popup_action(a, action));
            if (a === undefined) return;
            const actions = popup_actions.filter((a) => !is_same_popup_action(a, action));
            await setPopupActions(actions);
        },
        [popup_actions, setPopupActions],
    );

    return [popup_actions, { deletePopupAction }];
};
