import type { PlasmoMessaging } from '@plasmohq/messaging';

import type { IdentityId, ShowIdentityKey } from '~types/identity';

export type RequestBody = undefined;
export type ResponseBody =
    | {
          current_identity: IdentityId;
          identity_list: ShowIdentityKey[];
          main_mnemonic_identity?: string;
      }
    | undefined;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (req, res) => {
    if (req.body === undefined) throw new Error(`can not find request body from direct-show-identity port`);

    const alive = await $bgsw_check_alive(req.body);
    res.send(alive);
};

export default handler;
