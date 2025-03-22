import { Button } from '@heroui/react';
import { useCallback, useMemo, useRef } from 'react';
import { formatEther } from 'viem';

import { ShowSingleAddress } from '~/pages/home/components/show-address';
import ic_svg from '~assets/svg/chains/ic.min.svg';
import Icon from '~components/icon';
import { useSignMessage, useSignTypedData } from '~hooks/evm/viem';
import { set_local_action_result } from '~hooks/store/local';
import { useCurrentConnectedApps, useCurrentIdentity } from '~hooks/store/local-secure';
import { truncate_text } from '~lib/utils/text';
import { AddressTooltip } from '~pages/home/components/address-tooltip';
import type { PopupAction } from '~types/actions';
import type { ApproveEvmSignMessageAction, TypedData } from '~types/actions/approve/evm/sign-message';
import { match_chain } from '~types/chain';

const Detail = ({ approveEvmSignMessageAction }: { approveEvmSignMessageAction: ApproveEvmSignMessageAction }) => {
    const { method, params } = approveEvmSignMessageAction.payload;
    const { chain } = approveEvmSignMessageAction;

    const renderMessage = () => {
        switch (method) {
            case 'personal_sign': {
                const [message, address] = params;
                return (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-[#999999]">Message</span>
                            <span className="text-sm">{message}</span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-[#999999]">Address</span>
                            <span className="text-sm">{truncate_text(address)}</span>
                        </div>
                    </>
                );
            }
            case 'eth_sign': {
                const [address, messageHash] = params;
                return (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-[#999999]">Address</span>
                            <span className="text-sm">{truncate_text(address)}</span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-[#999999]">Message Hash</span>
                            <span className="text-sm">{messageHash}</span>
                        </div>
                    </>
                );
            }
            case 'eth_signTypedData': {
                const [typedData, address] = params;
                return (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-[#999999]">Address</span>
                            <span className="text-sm">{truncate_text(address)}</span>
                        </div>
                        <div className="mt-3 flex w-full flex-col gap-2">
                            <span className="text-sm text-[#999999]">Primary Type</span>
                            <span className="text-sm font-medium">{typedData.primaryType}</span>
                        </div>
                        {typedData.domain && (
                            <div className="mt-3 flex w-full flex-col gap-2">
                                <span className="text-sm text-[#999999]">Domain</span>
                                <pre className="max-h-24 overflow-auto rounded-md bg-[#1C1C1E] p-2 text-xs">
                                    {JSON.stringify(typedData.domain, null, 2)}
                                </pre>
                            </div>
                        )}
                        <div className="mt-3 flex w-full flex-col gap-2">
                            <span className="text-sm text-[#999999]">Types</span>
                            <pre className="max-h-36 overflow-auto rounded-md bg-[#1C1C1E] p-2 text-xs">
                                {JSON.stringify(typedData.types, null, 2)}
                            </pre>
                        </div>
                        <div className="mt-3 flex w-full flex-col gap-2">
                            <span className="text-sm text-[#999999]">Message</span>
                            <pre className="max-h-36 overflow-auto rounded-md bg-[#1C1C1E] p-2 text-xs">
                                {JSON.stringify(typedData.message, null, 2)}
                            </pre>
                        </div>
                    </>
                );
            }
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4': {
                const [address, jsonString] = params;
                const typedData = JSON.parse(jsonString);
                return (
                    <>
                        <div className="flex w-full items-center justify-between">
                            <span className="text-sm text-[#999999]">Address</span>
                            <span className="text-sm">{truncate_text(address)}</span>
                        </div>
                        <div className="mt-3 flex w-full flex-col gap-2">
                            <span className="text-sm text-[#999999]">Primary Type</span>
                            <span className="text-sm font-medium">{typedData.primaryType}</span>
                        </div>
                        {typedData.domain && (
                            <div className="mt-3 flex w-full flex-col gap-2">
                                <span className="text-sm text-[#999999]">Domain</span>
                                <pre className="max-h-24 overflow-auto rounded-md bg-[#1C1C1E] p-2 text-xs">
                                    {JSON.stringify(typedData.domain, null, 2)}
                                </pre>
                            </div>
                        )}
                        <div className="mt-3 flex w-full flex-col gap-2">
                            <span className="text-sm text-[#999999]">Types</span>
                            <pre className="max-h-36 overflow-auto rounded-md bg-[#1C1C1E] p-2 text-xs">
                                {JSON.stringify(typedData.types, null, 2)}
                            </pre>
                        </div>
                        <div className="mt-3 flex w-full flex-col gap-2">
                            <span className="text-sm text-[#999999]">Message</span>
                            <pre className="max-h-36 overflow-auto rounded-md bg-[#1C1C1E] p-2 text-xs">
                                {JSON.stringify(typedData.message, null, 2)}
                            </pre>
                        </div>
                    </>
                );
            }
        }
    };

    return (
        <div className="mt-4 flex flex-col gap-y-3 px-4">
            <div className="flex w-full items-center justify-between">
                <span className="text-sm text-[#999999]">Chain</span>
                <span className="text-sm">{chain.toLocaleUpperCase()}</span>
            </div>
            <div className="flex w-full items-center justify-between">
                <span className="text-sm text-[#999999]">Method</span>
                <span className="text-sm">{method}</span>
            </div>
            {renderMessage()}
        </div>
    );
};

function ApproveEvmSignMessageActionPage({
    action,
    approveEvmSignMessageAction,
    deletePopupAction,
}: {
    action: PopupAction;
    approveEvmSignMessageAction: ApproveEvmSignMessageAction;
    deletePopupAction: (action: PopupAction) => Promise<void>;
}) {
    const chain = approveEvmSignMessageAction.chain;
    const [current_connected_apps] = useCurrentConnectedApps();

    const app = useMemo(() => {
        if (!current_connected_apps) return undefined;
        const origin = approveEvmSignMessageAction.origin;
        const apps = match_chain(chain, {
            ic: () => {
                throw new Error('IC chain does not support');
            },
            ethereum: () => current_connected_apps.ethereum,
            ethereum_test_sepolia: () => current_connected_apps.ethereum_test_sepolia,
            polygon: () => current_connected_apps.polygon,
            polygon_test_amoy: () => current_connected_apps.polygon_test_amoy,
            bsc: () => current_connected_apps.bsc,
            bsc_test: () => current_connected_apps.bsc_test,
        });
        const app = apps.find((app) => app.origin === origin);
        return app;
    }, [approveEvmSignMessageAction, current_connected_apps]);

    const { current_identity } = useCurrentIdentity();

    const address = match_chain(chain, {
        ic: () => {
            throw new Error('IC chain is not supported');
        },
        ethereum: () => current_identity?.address.ethereum?.address,
        ethereum_test_sepolia: () => current_identity?.address.ethereum_test_sepolia?.address,
        polygon: () => current_identity?.address.polygon?.address,
        polygon_test_amoy: () => current_identity?.address.polygon_test_amoy?.address,
        bsc: () => current_identity?.address.bsc?.address,
        bsc_test: () => current_identity?.address.bsc_test?.address,
    });
    const { method, params } = approveEvmSignMessageAction.payload;
    const { mutateAsync: signMessage } = useSignMessage(chain);
    const { mutateAsync: signTypedData } = useSignTypedData(chain);

    const onAction = useCallback(
        async (type: 'deny' | 'approve') => {
            try {
                if (type === 'deny') {
                    await deletePopupAction(action);
                    await set_local_action_result(approveEvmSignMessageAction.id, { err: 'user rejected' });
                } else {
                    let result: string;
                    switch (method) {
                        case 'personal_sign':
                        case 'eth_sign':
                            result = await signMessage({ message: params[0] });
                            break;
                        case 'eth_signTypedData':
                            const typedData = params[0];
                            const account = params[1];
                            if (address && address === account) {
                                result = await signTypedData({
                                    message: typedData.message,
                                    types: typedData.types,
                                    primaryType: typedData.primaryType,
                                });
                            } else {
                                throw new Error('Account mismatch');
                            }
                            break;
                        case 'eth_signTypedData_v3':
                        case 'eth_signTypedData_v4':
                            {
                                const typedData = JSON.parse(params[1]) as TypedData;
                                const account = params[0];
                                if (address && address === account) {
                                    result = await signTypedData({
                                        message: typedData.message,
                                        types: typedData.types,
                                        primaryType: typedData.primaryType,
                                    });
                                } else {
                                    throw new Error('Account mismatch');
                                }
                            }
                            break;
                        default:
                            throw new Error('Unsupported method');
                    }
                    await set_local_action_result(approveEvmSignMessageAction.id, { ok: result });
                }
            } catch (error) {
                await set_local_action_result(approveEvmSignMessageAction.id, { err: 'failed to sign message' });
            }
        },
        [current_identity, approveEvmSignMessageAction, deletePopupAction, chain, method, params],
    );

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
                <div className="block text-sm text-[#999999]">{app?.origin}</div>
                <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#181818] px-4 py-3">
                    <span className="text-sm">Account</span>
                    <span className="text-sm text-[#999999]">{current_identity?.name || ''}</span>
                </div>
                <Detail approveEvmSignMessageAction={approveEvmSignMessageAction} />
            </div>

            <div className="grid w-full grid-cols-2 gap-x-3 p-5">
                {/* <Button onPress={() => onAction('deny')}>Always Deny</Button> */}
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
                    Confirm
                </Button>
            </div>
        </div>
    );
}

export default ApproveEvmSignMessageActionPage;
