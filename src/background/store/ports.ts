import { getPort } from '@plasmohq/messaging/background';

import { DIRECT_PORT_CURRENT_IDENTITY, DIRECT_PORT_POPUP_ACTIONS, DIRECT_PORT_SHOW_IDENTITY_LIST } from '~lib/messages';

// ! many problems
export const $bgsw_post_popup_actions = () => getPort(DIRECT_PORT_POPUP_ACTIONS).postMessage({});
export const $bgsw_post_show_identity_list = () => getPort(DIRECT_PORT_SHOW_IDENTITY_LIST).postMessage({});
export const $bgsw_post_current_identity = () => getPort(DIRECT_PORT_CURRENT_IDENTITY).postMessage({});
