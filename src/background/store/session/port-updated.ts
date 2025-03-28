import { __get_session_storage } from '~lib/storage';
import { SESSION_KEY_PORT_UPDATED } from '~lib/storage/keys';

export const $bgsw_port_updated = async () => __get_session_storage().setItem(SESSION_KEY_PORT_UPDATED, Date.now());
