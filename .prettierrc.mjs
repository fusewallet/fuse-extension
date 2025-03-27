/**
 * @type {import('prettier').Options}
 */
export default {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: false,
    vueIndentScriptAndStyle: false,
    proseWrap: 'always',
    htmlWhitespaceSensitivity: 'strict',
    endOfLine: 'lf',
    arrowParens: 'always',
    quoteProps: 'as-needed',
    plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
    importOrder: [
        '<BUILTIN_MODULES>', // Node.js built-in modules
        '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
        '', // Empty line
        '^@plasmo/(.*)$',
        '',
        '^@plasmohq/(.*)$',
        '',
        '^data-base64(.*)$',
        '',
        '^~(.*)$',
        '',
        '^[./]',
    ],
    importOrderGroupNamespaceSpecifiers: true,
    importOrderSortSpecifiers: true,
    importOrderCaseInsensitive: true,
};
