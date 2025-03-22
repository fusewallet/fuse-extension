import React from 'react';

export interface IconProps {
    name: string;
    className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
    return (
        <svg className={`icon ${className}`} aria-hidden="true">
            <use xlinkHref={`#${name}`} />
        </svg>
    );
};

export default Icon;
