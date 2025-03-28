import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { AiFillCar } from 'react-icons/ai';
import { BsLightning } from 'react-icons/bs';
import { IoSettingsOutline } from 'react-icons/io5';
import { PiBicycle, PiWarningCircle } from 'react-icons/pi';
import { formatUnits, parseEther, parseUnits } from 'viem';

import type { GasFeeEstimate, SuggestedGasFees } from '~apis/evm';
import InputCustom from '~components/input-custom';
import { Button } from '~components/ui/button';
import { Checkbox } from '~components/ui/checkbox';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '~components/ui/drawer';
import { useSuggestedGasFees } from '~hooks/apis/evm';
import { get_viem_chain_by_chain } from '~hooks/evm/viem';
import { useSonnerToast } from '~hooks/toast';
// import { useSonnerToast } from '~hooks/toast';
import { cn } from '~lib/utils/cn';
import { format_number_smart } from '~pages/functions/token/evm';
import type { EvmChain } from '~types/chain';

export interface NetworkFee {
    icon: string | React.ReactNode;
    name: 'Slow' | 'Average' | 'Fast' | 'Custom';
    details: GasFeeEstimate;
    className?: string;
}

export const NetworkFeeDrawer = ({
    trigger,
    container,
    current_fee,
    setCurrentFee,
    estimated_gas_limit,
    chain,
    customGasLimit,
    setCustomGasLimit,
}: {
    trigger: React.ReactNode;
    container?: HTMLElement | null;
    current_fee: NetworkFee | undefined;
    setCurrentFee: (fee: NetworkFee) => void;
    chain: EvmChain;
    estimated_gas_limit?: bigint;
    customGasLimit?: string;
    setCustomGasLimit: (v: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    useEffect(() => {
        return () => {
            setShowCustom(false);
        };
    }, [open]);

    const { data: suggested_gas_fees } = useSuggestedGasFees(chain);
    const { fee_list, default_custom } = useMemo<{ fee_list?: NetworkFee[]; default_custom?: NetworkFee }>(
        () => ({
            fee_list: suggested_gas_fees
                ? [
                      {
                          icon: <PiBicycle className="h-8 w-8 text-[#F15A24]" />,
                          name: 'Slow',
                          details: suggested_gas_fees.low,
                          className: 'text-[#F15A24]',
                      },
                      {
                          icon: <AiFillCar className="h-8 w-8 text-[#32B1FB]" />,
                          name: 'Average',
                          details: suggested_gas_fees.medium,
                          className: 'text-[#32B1FB]',
                      },
                      {
                          icon: <BsLightning className="h-8 w-8 text-[#07C160]" />,
                          name: 'Fast',
                          details: suggested_gas_fees.high,
                          className: 'text-[#07C160]',
                      },
                  ]
                : undefined,
            default_custom: suggested_gas_fees
                ? {
                      icon: <IoSettingsOutline className="h-8 w-8 text-[#999]" />,
                      name: 'Custom',
                      details: suggested_gas_fees.medium,
                  }
                : undefined,
        }),
        [suggested_gas_fees],
    );
    const chain_info = get_viem_chain_by_chain(chain);
    const [customMaxBaseFee, setCustomMaxBaseFee] = useState<string>();
    const [customMaxPriorityFee, setCustomMaxPriorityFee] = useState<string>();
    const [custom, setCustom] = useState<NetworkFee>();
    const final_custom = custom ?? default_custom;

    const checkFee = (item?: NetworkFee) => {
        if (!item) return;
        setCurrentFee(item);

        if (item.name === 'Custom') {
            setCustomMaxBaseFee(
                BigNumber(default_custom?.details.suggestedMaxFeePerGas ?? '0')
                    .minus(BigNumber(default_custom?.details.suggestedMaxPriorityFeePerGas ?? '0'))
                    .toFixed(),
            );
            setCustomMaxPriorityFee(default_custom?.details.suggestedMaxPriorityFeePerGas ?? '0');
            setCustomGasLimit(estimated_gas_limit?.toString() ?? '');
            setShowCustom(true);
            return;
        }
        setShowCustom(false);
    };
    return (
        <Drawer open={open} onOpenChange={setOpen} container={container}>
            <DrawerTrigger>{trigger}</DrawerTrigger>
            <DrawerContent
                className="flex h-full !max-h-full w-full flex-col items-center justify-between border-0 bg-transparent pt-[50px]"
                overlayClassName="bg-black/50"
            >
                <DrawerHeader className="w-full shrink-0 border-t border-[#333333] bg-[#0a0600] px-5 pb-0 pt-1 text-left">
                    <DrawerTitle>
                        <div className="flex w-full items-center justify-between py-3">
                            <span className="text-sm text-white">Network Fee</span>
                            <DrawerClose>
                                <span className="cursor-pointer text-sm text-[#FFCF13] transition duration-300 hover:opacity-85">
                                    Close
                                </span>
                            </DrawerClose>
                        </div>
                    </DrawerTitle>
                    <DrawerDescription className="hidden" />
                </DrawerHeader>

                <div className="flex h-full w-full shrink flex-col justify-between bg-[#0a0600] px-5 pb-5">
                    <div className="mt-3 h-full w-full overflow-y-auto pb-10">
                        <div className="mt-5 flex w-full flex-col gap-4">
                            {fee_list?.map((item, idx) => (
                                <div
                                    key={`${item.name}-${idx}`}
                                    className={cn(
                                        'flex w-full cursor-pointer items-center rounded-xl border border-[#333] bg-[#0A0600] px-4 py-3 duration-300 hover:bg-[#333333]',
                                        current_fee && current_fee.name === item.name && 'border-[#FFCF13]',
                                        !current_fee && item.name === 'Average' && 'border-[#FFCF13]',
                                    )}
                                    onClick={() => checkFee(item)}
                                >
                                    <div className="mr-4 flex h-9 w-9 items-center justify-center">{item.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex w-full justify-between">
                                            <div className="text-base text-[#EEEEEE]">{item.name}</div>
                                            <p className="text-base text-[#eee]">
                                                {'< '}
                                                {item.details?.maxWaitTimeEstimate
                                                    ? item.details?.maxWaitTimeEstimate / 1000
                                                    : '--'}{' '}
                                                secs
                                            </p>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <div className="text-xs text-[#999]">
                                                {'Priority Fee:'}{' '}
                                                {format_number_smart(item.details?.suggestedMaxPriorityFeePerGas ?? 0)}{' '}
                                                Gwei
                                            </div>
                                            <p className="text-xs text-[#999999]">
                                                {format_number_smart(
                                                    formatUnits(
                                                        parseUnits(item.details?.suggestedMaxFeePerGas ?? '0', 9) *
                                                            (estimated_gas_limit ?? BigInt(0)),
                                                        18,
                                                    ),
                                                )}{' '}
                                                {chain_info.nativeCurrency.symbol}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div
                                className={cn(
                                    'flex w-full cursor-pointer flex-col rounded-xl border border-[#333] bg-[#0A0600] px-4 py-3 duration-300',
                                    current_fee && current_fee.name === 'Custom' && 'border-[#FFCF13]',
                                )}
                            >
                                <div
                                    className="flex w-full cursor-pointer items-center"
                                    onClick={() => checkFee(final_custom)}
                                >
                                    <div className="mr-4 flex h-9 w-9 items-center justify-center">
                                        {final_custom?.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex w-full justify-between">
                                            <div className="text-base text-[#EEEEEE]">{final_custom?.name}</div>
                                            <p className="text-base text-[#eee]">
                                                {'< '} {(final_custom?.details?.maxWaitTimeEstimate ?? 0) / 1000} secs
                                            </p>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <div className="text-xs text-[#999]">
                                                {final_custom?.details?.suggestedMaxPriorityFeePerGas} Gwei
                                            </div>
                                            <p className="text-xs text-[#999999]">
                                                {format_number_smart(
                                                    formatUnits(
                                                        parseUnits(
                                                            final_custom?.details?.suggestedMaxFeePerGas ?? '0',
                                                            9,
                                                        ) * (estimated_gas_limit ?? BigInt(0)),
                                                        18,
                                                    ),
                                                )}{' '}
                                                {chain_info.nativeCurrency.symbol}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {showCustom && (
                                    <div className="mt-2 w-full border-t border-[#333]">
                                        <div className="mt-2 w-full">
                                            <div className="flex w-full items-center justify-start text-sm text-[#eee]">
                                                <div>Max base fee</div>
                                                {/* <div className="text-xs text-[#999]">
                                                    Base fee required:{' '}
                                                    <span className="text-#eee">
                                                        {final_custom.details?.suggestedMaxFeePerGas}
                                                    </span>{' '}
                                                    Gwei
                                                </div> */}
                                            </div>
                                            <InputCustom
                                                className="mt-2"
                                                extra={<div className="text-xs text-[#999]">Gwei</div>}
                                                value={customMaxBaseFee}
                                                onChange={(value) => {
                                                    const regex = new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${9}})?$`);
                                                    if (
                                                        value === '' ||
                                                        value === '0' ||
                                                        value === '.' ||
                                                        regex.test(value)
                                                    ) {
                                                        setCustomMaxBaseFee(value);
                                                        return;
                                                    }
                                                }}
                                                placeholder="Max base fee"
                                            />
                                        </div>

                                        <div className="mt-2 w-full">
                                            <div className="flex w-full items-center justify-between text-sm text-[#eee]">
                                                <div>Priority fee</div>
                                            </div>
                                            <InputCustom
                                                className="mt-2"
                                                extra={<div className="text-xs text-[#999]">Gwei</div>}
                                                value={customMaxPriorityFee}
                                                onChange={(value) => {
                                                    const regex = new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${9}})?$`);
                                                    if (
                                                        value === '' ||
                                                        value === '0' ||
                                                        value === '.' ||
                                                        regex.test(value)
                                                    ) {
                                                        setCustomMaxPriorityFee(value);
                                                        return;
                                                    }
                                                }}
                                                placeholder="Priority fee"
                                            />
                                        </div>

                                        <div className="mt-2 w-full">
                                            <div className="flex w-full items-center justify-between text-sm text-[#eee]">
                                                <div>Gas limit</div>
                                            </div>
                                            <InputCustom
                                                className="mt-2"
                                                value={customGasLimit}
                                                onChange={(value) => {
                                                    // Integer
                                                    const regex = /^[1-9]\d*$/;
                                                    if (value === '' || regex.test(value)) {
                                                        setCustomGasLimit(value);
                                                    }
                                                }}
                                                placeholder="Gas limit"
                                            />
                                        </div>
                                        {/* // TODO */}
                                        {/* 
                                        <div className="mt-3 flex w-full items-center space-x-2">
                                            <Checkbox id="terms" className="border-[#333]" />
                                            <label
                                                htmlFor="terms"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Set as default for all future transactions onEthereum
                                            </label>
                                        </div> */}

                                        <div className="mt-3 w-full">
                                            <Button
                                                className="h-[48px] w-full bg-[#FFCF13] text-lg font-semibold text-black hover:bg-[#FFCF13]/70 disabled:bg-[#FFCF13]/40"
                                                disabled={
                                                    BigNumber(customMaxBaseFee ?? '').isNaN() ||
                                                    BigNumber(customMaxPriorityFee ?? '').isNaN() ||
                                                    BigNumber(customGasLimit ?? '').isNaN()
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!default_custom) return;
                                                    const fee = {
                                                        ...default_custom,
                                                        details: {
                                                            ...default_custom.details,
                                                            suggestedMaxPriorityFeePerGas: BigNumber(
                                                                customMaxPriorityFee ?? '0',
                                                            ).toFixed(),
                                                            suggestedMaxFeePerGas: BigNumber(customMaxBaseFee ?? '0')
                                                                .plus(BigNumber(customMaxPriorityFee ?? '0'))
                                                                .toFixed(),
                                                        },
                                                    };
                                                    setCustom(fee);
                                                    setCurrentFee(fee);
                                                    setShowCustom(false);
                                                }}
                                            >
                                                Confirm
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {showCustom && (
                            <div className="mt-2 flex items-center justify-start gap-x-2 text-sm text-[#333]">
                                <div className="flex h-5 w-5 items-center">
                                    <PiWarningCircle className="h-5 w-5 text-[#999]" />
                                </div>
                                <div className="text-[#eee]">
                                    The estimated network fee may increase if network conditions change.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
