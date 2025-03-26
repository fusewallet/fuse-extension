import type { PopupActions } from '~types/actions';

let inner_popup_actions: PopupActions = [];

export const $bgsw_get_popup_actions = async () => inner_popup_actions;

// TODO how to notice data which dependency this data?
export const $bgsw_set_popup_actions = async (actions: PopupActions) => (inner_popup_actions = actions);
