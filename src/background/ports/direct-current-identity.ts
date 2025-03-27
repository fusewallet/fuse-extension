import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_current_identity } from '~background/memo/ports/identity/current-identity';
import type { ShowIdentityKey } from '~types/identity';
import type { CurrentIdentityNetwork } from '~types/network';

export type RequestBody = undefined;
export type ResponseBody =
    | {
          current_identity: ShowIdentityKey | undefined;
          current_identity_network: CurrentIdentityNetwork | undefined;
      }
    | undefined;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    // if (req.body === undefined) throw new Error(`can not find request body from direct-show-identity port`);

    const current = await $bgsw_current_identity();
    res.send(current);
};

export default handler;
