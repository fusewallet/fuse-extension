import type { RequestBody, ResponseBody } from '~background/messages/direct-handle-identity';
import { DIRECT_MESSAGE_HANDLE_IDENTITY, type ExtractOkType } from '~lib/messages';
import { message_with_timeout } from '~lib/utils/timeout';
import type { CombinedIdentityKey, IdentityId, KeyRings } from '~types/identity';

const direct_message_handle_identity = async (body: RequestBody): Promise<ExtractOkType<ResponseBody>> => {
    const result = await message_with_timeout<RequestBody, ResponseBody>(DIRECT_MESSAGE_HANDLE_IDENTITY, body);

    if (!result) throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);

    if (result.err !== undefined) throw new Error(result.err);

    return result.ok;
};

export const direct_message_handle_identity_restore_identity = async (
    password: string,
    key_rings: KeyRings,
    initialized: string,
): Promise<boolean> => {
    const result = await direct_message_handle_identity({ restore_identity: { password, key_rings, initialized } });
    if (!('restore_identity' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.restore_identity;
};

export const direct_message_handle_identity_show_mnemonic = async (
    password: string,
    id: IdentityId,
): Promise<{ mnemonic: string; subaccount: number } | boolean | undefined> => {
    const result = await direct_message_handle_identity({ show_mnemonic: { password, id } });
    if (!('show_mnemonic' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.show_mnemonic;
};

export const direct_message_handle_identity_show_private_key = async (
    password: string,
    id: IdentityId,
): Promise<string | boolean | undefined> => {
    const result = await direct_message_handle_identity({ show_private_key: { password, id } });
    if (!('show_private_key' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.show_private_key;
};

export const direct_message_handle_identity_delete_identity = async (
    password: string,
    id: IdentityId,
): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ delete_identity: { password, id } });
    if (!('delete_identity' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.delete_identity;
};

export const direct_message_handle_identity_is_key_exist = async (
    key: CombinedIdentityKey,
): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ is_key_exist: key });
    if (!('is_key_exist' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.is_key_exist;
};

export const direct_message_handle_identity_push_identity = async (
    key: CombinedIdentityKey,
): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ push_identity: key });
    if (!('push_identity' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.push_identity;
};

export const direct_message_handle_identity_push_identity_by_main_mnemonic = async (
    count = 1,
): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ push_identity_by_main_mnemonic: count });
    if (!('push_identity_by_main_mnemonic' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.push_identity_by_main_mnemonic;
};

export const direct_message_handle_identity_update_identity = async (
    id: IdentityId,
    name: string,
    icon: string,
): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ update_identity: { id, name, icon } });
    if (!('update_identity' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.update_identity;
};

export const direct_message_handle_identity_switch_identity = async (id: IdentityId): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ switch_identity: id });
    if (!('switch_identity' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.switch_identity;
};

export const direct_message_handle_identity_resort_identity = async (
    source_index: number,
    destination_index: number | undefined,
): Promise<boolean | undefined> => {
    const result = await direct_message_handle_identity({ resort_identity: { source_index, destination_index } });
    if (!('resort_identity' in result))
        throw new Error(`can not get result from message: ${DIRECT_MESSAGE_HANDLE_IDENTITY}`);
    return result.resort_identity;
};
