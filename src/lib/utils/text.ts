export const truncate_principal = (pid: string): string => {
    if (!pid) return '';
    const arr = pid.split('-');
    return `${arr[0]}...${arr[arr.length - 1]}`;
};

export const truncate_text = (text: string): string => {
    const max_length = 8;
    if (text.length <= max_length) return text;
    const truncated = `${text.substring(0, 5)}...${text.substring(text.length - 3)}`;
    return truncated;
};
