import { getActorCreatorByAgent, principal2account, type ConnectedIdentity } from '@choptop/haw';
import { useEffect, useState } from 'react';

import { broadcastMessage } from '~background';
import { get_unique_ic_agent } from '~hooks/store/agent';
import { useCurrentIdentity } from '~hooks/store/local-secure';
import type { IdentityId } from '~types/identity';

const CACHED: Record<IdentityId, ConnectedIdentity> = {};

export const useCurrentConnectedIcIdentity = (current_identity: IdentityId | undefined) => {
    const [identity, setIdentity] = useState<ConnectedIdentity | undefined>(CACHED[current_identity ?? '']);

    useEffect(() => {
        if (!current_identity) return setIdentity(undefined);
        const agent = get_unique_ic_agent();
        if (!agent) return setIdentity(undefined);
        if (identity !== undefined) return; // ? already had
        agent.getPrincipal().then((p) => {
            const principal = p.toText();
            const identity: ConnectedIdentity = {
                principal,
                account: principal2account(principal),
                agent,
                creator: getActorCreatorByAgent(agent),
            };
            setIdentity((CACHED[current_identity] = identity));
        });
    }, [current_identity, identity]);

    return identity;
};

// watch current identity change and broadcast message
export const useWatchCurrentIdentity = () => {
    const { current_identity } = useCurrentIdentity();
    useEffect(() => {
        if (!current_identity || !current_identity.id) return;
        broadcastMessage({
            target: 'fusewallet-inpage',
            data: {
                name: 'fusewallet-provider',
                data: {
                    method: 'fusewallet_accountsChanged',
                    params: current_identity.address,
                },
            },
        });
    }, [current_identity?.id]);
};
