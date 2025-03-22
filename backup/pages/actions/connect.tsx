import { Button } from '@heroui/react';
import { useCallback, useRef } from 'react';

import { ShowSingleAddress } from '~/pages/home/components/show-address';
import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { identity_network_callback } from '~hooks/store/common';
import { push_local_record } from '~hooks/store/local';
import { useCurrentConnectedApps, useCurrentIdentity } from '~hooks/store/local-secure';
import { set_current_session_connected_app_once } from '~hooks/store/session';
import { MINUTE } from '~lib/utils/datetime';
import { truncate_text } from '~lib/utils/text';
import { AddressTooltip } from '~pages/home/components/address-tooltip';
import type { PopupAction } from '~types/actions';
import type { ConnectAction } from '~types/actions/connect';
import { match_connected_app_state, type ConnectedApp, type ConnectedAppState } from '~types/connect';
import type { FuseRecord } from '~types/records';

function ConnectActionPage({
    action,
    connect,
    deletePopupAction,
}: {
    action: PopupAction;
    connect: ConnectAction;
    deletePopupAction: (action: PopupAction) => Promise<void>;
}) {
    const [, , { current_identity_network, pushOrUpdateConnectedApp }] = useCurrentConnectedApps();

    const onAction = useCallback(
        async (type: 'deny' | 'deny_once' | 'granted_once' | 'granted' | 'granted_5m') => {
            if (!current_identity_network) return;
            // insert connected app info
            const now = Date.now();
            const state = await (async (): Promise<ConnectedAppState> => {
                switch (type) {
                    case 'deny':
                        return 'denied';
                    case 'deny_once':
                        return 'ask_on_use';
                    case 'granted_once':
                        return 'ask_on_use';
                    case 'granted':
                        return 'granted';
                    case 'granted_5m':
                        return { granted_expired: { created: now, duration: MINUTE * 5 } };
                }
            })();

            // ! push record
            const record_state = match_connected_app_state(state, {
                denied: () => undefined,
                ask_on_use: () => (type === 'granted_once' ? state : undefined),
                granted: () => state,
                denied_session: () => undefined,
                granted_session: () => state,
                denied_expired: () => undefined,
                granted_expired: () => state,
            });
            if (record_state !== undefined) {
                const record: FuseRecord = {
                    connected: {
                        type: 'connected',
                        created: now,
                        chain: connect.chain,
                        origin: connect.origin,
                        title: connect.title,
                        favicon: connect.favicon,
                        state: record_state,
                    },
                };
                await identity_network_callback(
                    connect.chain,
                    current_identity_network,
                    undefined,
                    async (identity_network) => push_local_record(identity_network, now, record),
                );
            }

            const app: ConnectedApp = {
                created: now,
                origin: connect.origin,
                title: connect.title,
                favicon: connect.favicon,
                state,
                updated: now,
            };
            console.log('🚀 ~ app:', app);
            pushOrUpdateConnectedApp(connect.chain, app)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            if (type === 'deny_once') {
                                set_current_session_connected_app_once(
                                    connect.chain,
                                    current_identity_network,
                                    connect.origin,
                                    connect.message_id,
                                    false,
                                ).then(resolve);
                            } else if (type === 'granted_once') {
                                set_current_session_connected_app_once(
                                    connect.chain,
                                    current_identity_network,
                                    connect.origin,
                                    connect.message_id,
                                    true,
                                ).then(resolve);
                            } else resolve();
                        }),
                )
                .then(() => deletePopupAction(action));
        },
        [connect, pushOrUpdateConnectedApp, deletePopupAction, action, current_identity_network],
    );

    const { current_identity } = useCurrentIdentity();

    const ref = useRef<HTMLDivElement>(null);
    return (
        <div ref={ref} className="flex h-full w-full flex-col justify-between">
            <div className="mt-4 flex items-center px-5">
                {current_identity && (
                    <>
                        <div className="flex items-center">
                            <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#333333] text-lg font-semibold text-[#999999]">
                                <div
                                    style={{
                                        lineHeight: '22px',
                                        fontSize: '22px',
                                        transform: 'translateY(1.5px)',
                                    }}
                                >
                                    {current_identity.icon}
                                </div>
                            </div>

                            {/** copy address  */}
                            <AddressTooltip
                                container={ref.current ?? undefined}
                                trigger={
                                    <div className="flex flex-row items-center justify-center text-[#EEEEEE] transition duration-300 hover:text-[#FFCF13]">
                                        <span className="cursor-pointer px-2 text-base">{current_identity.name}</span>
                                        <Icon name="icon-copy" className="h-[14px] w-[14px] cursor-pointer" />
                                    </div>
                                }
                                content={
                                    <div className="flex flex-col gap-y-2 p-[10px]">
                                        {current_identity.address.ic?.owner && (
                                            <ShowSingleAddress
                                                address={current_identity.address.ic.owner}
                                                truncated={truncate_text(current_identity.address.ic.owner)}
                                                icon={ic_svg}
                                                name="Principal ID"
                                            />
                                        )}
                                        {current_identity.address.ic?.account_id && (
                                            <ShowSingleAddress
                                                address={current_identity.address.ic.account_id}
                                                truncated={truncate_text(current_identity.address.ic.account_id)}
                                                icon={ic_svg}
                                                name="Account ID"
                                            />
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="overflow-y-1 mt-4 w-full flex-1 px-5">
                <div className="flex w-full items-center">
                    {connect.favicon ? (
                        <img src={connect.favicon} className="mr-3 h-12 w-12 rounded-full" />
                    ) : (
                        <Icon name="icon-web" className="mr-3 h-12 w-12 rounded-full"></Icon>
                    )}
                    <div className="w-auto">
                        <strong className="block text-lg font-semibold">Connect</strong>
                        <span className="text-sm text-[#999999]">{connect.origin}</span>
                    </div>
                </div>
                <div className="block py-2 text-sm text-[#999999]">{connect.title}</div>
                <div className="block text-sm text-[#999999]">{connect.origin}</div>
                <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#181818] px-4 py-3">
                    <span className="text-sm">Account</span>
                    <span className="text-sm text-[#999999]">{current_identity?.name || ''}</span>
                </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-x-3 p-5">
                {/* <Button onPress={() => onAction('deny')}>Always Deny</Button> */}
                <Button
                    className="h-12 w-full rounded-xl bg-[#666666] text-lg font-semibold text-white"
                    onPress={() => onAction('deny_once')}
                >
                    Cancel
                </Button>
                <Button
                    className="h-12 w-full rounded-xl bg-[#FFCF13] text-lg font-semibold text-black"
                    onPress={() => onAction('granted_once')}
                >
                    Connect
                </Button>
                {/* <Button onPress={() => onAction('granted')}>Always Granted</Button> */}
                {/* <Button onPress={() => onAction('granted_5m')}>Granted 5m</Button> */}
            </div>
        </div>
    );
}

export default ConnectActionPage;
