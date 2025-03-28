import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_show_identity_list } from '~background/memo/ports/identity/show-identity-list';
import type { IdentityId, ShowIdentityKey } from '~types/identity';

export type RequestBody = undefined;
export type ResponseBody =
    | {
          current_identity: IdentityId;
          identity_list: ShowIdentityKey[];
          main_mnemonic_identity?: string;
      }
    | undefined;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    // if (req.body === undefined) throw new Error(`can not find request body from direct/show-identity port`);

    const show = await $bgsw_show_identity_list();
    res.send(show);
};

export default handler;
