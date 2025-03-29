import type { PlasmoMessaging } from '@plasmohq/messaging';

import { $bgsw_get_chain_networks } from '~background/store/secure/chain_networks';
import type { ChainNetworks } from '~types/network';

export type RequestBody = undefined;
export type ResponseBody = ChainNetworks;

const handler: PlasmoMessaging.PortHandler<RequestBody, ResponseBody> = async (_, res) => {
    // if (req.body === undefined) throw new Error(`can not find request body from direct/chain-networks port`);

    const chain_networks = await $bgsw_get_chain_networks();
    res.send(chain_networks);
};

export default handler;
