import BigNumber from 'bignumber.js';

/**
 * The `format_number` function takes a number, string, or BigNumber and formats it with a specified
 * number of decimals.
 * @param {number | string | BigNumber} num - The `num` parameter in the `format_number` function can
 * accept a number, a string, or a BigNumber.
 * @param [decimals=2] - The `decimals` parameter in the `format_number` function specifies the number
 * of decimal places to include in the formatted number. By default, it is set to 2 if no value is
 * provided when calling the function. You can adjust this parameter to change the precision of the
 * formatted number output.
 * @returns The `format_number` function returns a string representation of the input number with the
 * specified number of decimal places formatted using the `toFormat` method of the BigNumber library.
 */
export const format_number = (num: number | string | BigNumber, decimals = 2): string => {
    let n: BigNumber | undefined = undefined;
    if (typeof num === 'string') n = BigNumber(num);
    else if (typeof num === 'number') n = BigNumber(num);
    else n = num;
    return n.toFormat(decimals);
};
