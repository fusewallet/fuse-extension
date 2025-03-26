import type { PlasmoMessaging } from '@plasmohq/messaging';

// import { $bgsw_delete_identity } from '~background/memo/messages/identity/delete-identity';
// import { $bgsw_is_key_exist } from '~background/memo/messages/identity/is-key-exist';
// import { $bgsw_push_identity } from '~background/memo/messages/identity/push-identity';
// import { $bgsw_push_identity_by_main_mnemonic } from '~background/memo/messages/identity/push-identity-by-mnemonic';
// import { $bgsw_resort_identity } from '~background/memo/messages/identity/resort-identity';
// import { $bgsw_restore_identity } from '~background/memo/messages/identity/restore-identity';
// import { $bgsw_show_mnemonic } from '~background/memo/messages/identity/show-mnemonic';
// import { $bgsw_show_private_key } from '~background/memo/messages/identity/show-private-key';
// import { $bgsw_switch_identity } from '~background/memo/messages/identity/switch-identity';
// import { $bgsw_update_identity } from '~background/memo/messages/identity/update-identity';
import type { MessageResult } from '~lib/messages';
import type { CombinedIdentityKey, IdentityId, KeyRings } from '~types/identity';

export type RequestBody =
    | { restore_identity: { password: string; key_rings: KeyRings } }
    | { show_mnemonic: { password: string; id: IdentityId } }
    | { show_private_key: { password: string; id: IdentityId } }
    | { delete_identity: { password: string; id: IdentityId } }
    | { is_key_exist: CombinedIdentityKey }
    | { push_identity: CombinedIdentityKey }
    | { push_identity_by_main_mnemonic: number }
    | { update_identity: { id: IdentityId; name: string; icon: string } }
    | { switch_identity: IdentityId }
    | { resort_identity: { source_index: number; destination_index: number | undefined } };
export type ResponseBody = MessageResult<
    | { restore_identity: boolean }
    | { show_mnemonic: { mnemonic: string; subaccount: number } | boolean | undefined }
    | { show_private_key: string | boolean | undefined }
    | { delete_identity: boolean | undefined }
    | { is_key_exist: boolean }
    | { push_identity: boolean | undefined }
    | { push_identity_by_main_mnemonic: boolean | undefined }
    | { update_identity: boolean | undefined }
    | { switch_identity: boolean | undefined }
    | { resort_identity: boolean | undefined },
    string
>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (req.body === undefined) throw new Error(`can not find request body from direct-handle-identity message`);

    // if ('restore_identity' in req.body) {
    //     return res.send({ ok: { restore_identity: await $bgsw_restore_identity(req.body.restore_identity) } });
    // }

    // if ('show_mnemonic' in req.body) {
    //     return res.send({ ok: { show_mnemonic: await $bgsw_show_mnemonic(req.body.show_mnemonic) } });
    // }

    // if ('show_private_key' in req.body) {
    //     return res.send({ ok: { show_private_key: await $bgsw_show_private_key(req.body.show_private_key) } });
    // }

    // if ('delete_identity' in req.body) {
    //     return res.send({ ok: { delete_identity: await $bgsw_delete_identity(req.body.delete_identity) } });
    // }

    // if ('is_key_exist' in req.body) {
    //     return res.send({ ok: { is_key_exist: await $bgsw_is_key_exist(req.body.is_key_exist) } });
    // }

    // if ('push_identity' in req.body) {
    //     return res.send({ ok: { push_identity: await $bgsw_push_identity(req.body.push_identity) } });
    // }

    // if ('push_identity_by_main_mnemonic' in req.body) {
    //     return res.send({
    //         ok: {
    //             push_identity_by_main_mnemonic: await $bgsw_push_identity_by_main_mnemonic(
    //                 req.body.push_identity_by_main_mnemonic,
    //             ),
    //         },
    //     });
    // }

    // if ('update_identity' in req.body) {
    //     return res.send({
    //         ok: {
    //             update_identity: await $bgsw_update_identity(req.body.update_identity),
    //         },
    //     });
    // }

    // if ('switch_identity' in req.body) {
    //     return res.send({
    //         ok: {
    //             switch_identity: await $bgsw_switch_identity(req.body.switch_identity),
    //         },
    //     });
    // }

    // if ('resort_identity' in req.body) {
    //     return res.send({
    //         ok: {
    //             resort_identity: await $bgsw_resort_identity(req.body.resort_identity),
    //         },
    //     });
    // }

    throw new Error(`can not find action: ${Object.keys(req.body)[0]} for direct-handle-identity message`);
};

export default handler;
