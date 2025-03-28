import { Input } from '@heroui/react';
import { useState } from 'react';

import { cn } from '~lib/utils/cn';

function InputCustom({
    placeholder,
    errorMessage,
    onChange,
    extra,
    className = '',
    value,
}: {
    placeholder?: string;
    errorMessage?: string;
    onChange: (value: string) => void;
    extra?: React.ReactNode;
    className?: string;
    value?: string;
}) {
    return (
        <Input
            className={cn('w-full', className)}
            classNames={{
                mainWrapper: ['relative'],
                inputWrapper: [
                    'border-1',
                    'border-[#333333]',
                    'outline-[0px]',
                    'text-[#EEEEEE]',
                    '!rounded-xl',
                    errorMessage
                        ? 'group-data-[focus=true]:!border-[#ff2c3f]'
                        : 'group-data-[focus=true]:!border-[#fece13]',
                    errorMessage
                        ? 'group-data-[hover=true]:!border-[#ff2c3f]'
                        : 'group-data-[hover=true]:!border-[#fece13]',
                    errorMessage ? '!hover:border-[#ff2c3f]' : '!hover:border-[#fece13]',
                ],
                helperWrapper: ['absolute bottom-[-20px] left-0'],
            }}
            endContent={extra}
            placeholder={placeholder}
            type={'text'}
            variant="bordered"
            errorMessage={errorMessage}
            isInvalid={!!errorMessage}
            color={!value ? undefined : errorMessage ? 'danger' : 'success'}
            onChange={(e) => {
                const value = e.target.value;
                onChange(value);
            }}
            value={value}
            size="lg"
        />
    );
}

export default InputCustom;
