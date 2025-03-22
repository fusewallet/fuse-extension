import { Button } from '@heroui/react';
import { useCallback, useMemo, useRef } from 'react';

import { ShowSingleAddress } from '~/pages/home/components/show-address';
import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { set_local_secure_approved, useCurrentConnectedApps, useCurrentIdentity } from '~hooks/store/local-secure';
import { set_current_session_approve_once } from '~hooks/store/session';
import { parse_factory } from '~lib/utils/json';
import { truncate_text } from '~lib/utils/text';
import { AddressTooltip } from '~pages/home/components/address-tooltip';
import { get_popup_action_id, type PopupAction } from '~types/actions';
import type { ApprovedState } from '~types/actions/approve';
import type { ApproveIcAction } from '~types/actions/approve/ic';

const parse = parse_factory(JSON.parse);

function ApproveIcActionPage({
    action,
    approve_ic,
    deletePopupAction,
}: {
    action: PopupAction;
    approve_ic: ApproveIcAction;
    deletePopupAction: (action: PopupAction) => Promise<void>;
}) {
    const [current_connected_apps, , { current_identity_network }] = useCurrentConnectedApps();

    const args = useMemo(() => parse(approve_ic.args_json), [approve_ic]);
    console.log('🚀 ~ args:', args);

    const app = useMemo(() => {
        if (!current_connected_apps) return undefined;
        const origin = approve_ic.origin;
        const apps = current_connected_apps.ic;
        const app = apps.find((app) => app.origin === origin);
        return app;
    }, [approve_ic, current_connected_apps]);

    const onAction = useCallback(
        async (type: 'deny' | 'approve') => {
            if (!current_identity_network) return;
            // record
            const approve_id = get_popup_action_id(action);
            const state: ApprovedState = 'ask_on_use';

            set_local_secure_approved('ic', current_identity_network, approve_ic.origin, approve_ic.request_hash, state)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            if (type === 'deny') {
                                set_current_session_approve_once(
                                    'ic',
                                    current_identity_network,
                                    approve_ic.origin,
                                    approve_id,
                                    false,
                                ).then(resolve);
                            } else if (type === 'approve') {
                                set_current_session_approve_once(
                                    'ic',
                                    current_identity_network,
                                    approve_ic.origin,
                                    approve_id,
                                    true,
                                ).then(resolve);
                            } else resolve();
                        }),
                )
                .then(() => deletePopupAction(action));
        },
        [approve_ic, deletePopupAction, action, current_identity_network],
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
                    {app?.favicon ? (
                        <img src={app.favicon} className="mr-3 h-12 w-12 rounded-full" />
                    ) : (
                        <Icon name="icon-web" className="mr-3 h-12 w-12 rounded-full"></Icon>
                    )}
                    <div className="w-auto">
                        <strong className="block text-lg font-semibold">Sign Message</strong>
                        <span className="text-sm text-[#999999]">{app?.origin}</span>
                    </div>
                </div>

                <div className="block py-2 text-sm text-[#999999]">{app?.title}</div>
                <div className="block text-sm text-[#999999]">{approve_ic.origin}</div>
                {/* {JSON.stringify(approve_ic)} */}
                <div className="mt-4 w-full rounded-xl bg-[#181818] px-4 py-3">
                    <h3 className="block text-lg font-semibold">Message</h3>
                    <div className="block max-h-[250px] w-full overflow-y-scroll break-words pt-2 text-sm text-[#999999]">
                        This application wants you to authorize a transaction with your ICP account:
                        <br />
                        <strong>Request Hash:</strong> {approve_ic.request_hash}
                        <br />
                        <strong>Origin:</strong> {approve_ic.origin}
                        <br />
                        <strong>Canister ID:</strong> {approve_ic.canister_id}
                        <br />
                        <strong>Method:</strong> {approve_ic.method}
                        <br />
                        <strong>Transaction Details:</strong>
                        <br />
                        {approve_ic.args_json}
                    </div>
                </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-x-3 p-5">
                <Button
                    className="h-12 w-full rounded-xl bg-[#666666] text-lg font-semibold text-white"
                    onPress={() => onAction('deny')}
                >
                    Cancel
                </Button>
                <Button
                    className="h-12 w-full rounded-xl bg-[#FFCF13] text-lg font-semibold text-black"
                    onPress={() => onAction('approve')}
                >
                    Approve
                </Button>
            </div>
        </div>
    );
}

export default ApproveIcActionPage;
