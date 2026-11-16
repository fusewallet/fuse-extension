import * as fs from 'fs';
import * as path from 'path';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

type TokenItem = {
    ledger_canister_id: string;
    token_type: string; // chain_key
    icrc1_metadata: {
        icrc1_fee: string;
        icrc1_name: string;
        icrc1_logo: string;
        icrc1_symbol: string;
        icrc1_decimals: string;
    };
};

const main = async () => {
    const response = await fetch(
        'https://icrc-api.internetcomputer.org/api/v2/ledgers?limit=100&token_types=chain_key&include_total_supply_7d=true&network=mainnet&sort_by=-total_transactions_count_over_past_7d',
    );
    const json = await response.json();
    const data = json.data as TokenItem[];

    // save images
    let items: {
        token: TokenItem;
        ext: string;
        import_logo_name: string;
        token_info_name: string;
    }[] = [];
    for (const d of data) {
        const logo = d.icrc1_metadata.icrc1_logo;
        let ext = (() => {
            if (logo.startsWith('data:image/svg+xml')) return 'svg';
            throw new Error(`unknown logo extension: ${logo}`);
        })();
        const name = `${d.icrc1_metadata.icrc1_symbol}.${ext}`;
        const binary = Buffer.from(logo.replace(/^data:image\/(png|jpeg|jpg|svg\+xml);base64,/, ''), 'base64');
        fs.writeFileSync(path.join(__dirname, '../src/assets/svg/tokens/ic/ck', name), binary);
        const n = d.icrc1_metadata.icrc1_symbol.replace('ck', '').toUpperCase();
        items.push({
            token: d,
            ext,
            import_logo_name: `TOKEN_IC_CK_${n}_${ext.toUpperCase()}`,
            token_info_name: `TOKEN_INFO_IC_CK_${n}`,
        });
    }
    // 排序
    items = _.sortBy(items, (item) => item.token.ledger_canister_id);

    // print token info
    const format_fee = (fee: string) => BigNumber(fee).toFormat({ groupSize: 3, groupSeparator: '_' });
    const max_token_info_length = Math.max(...items.map((item) => item.token_info_name.length));
    const max_token_name_length = Math.max(...items.map((item) => item.token.icrc1_metadata.icrc1_name.length));
    const max_decimals_length = Math.max(...items.map((item) => item.token.icrc1_metadata.icrc1_decimals.length));
    const max_fee_length = Math.max(...items.map((item) => format_fee(item.token.icrc1_metadata.icrc1_fee).length));
    console.log(``);
    console.log(`============== token info ==============`);
    console.log(`// CK`);
    for (const item of items) {
        let token_info_spaces = '';
        for (let i = 0; i < max_token_info_length - item.token_info_name.length; i++) token_info_spaces += ' ';
        let token_name_spaces = '';
        for (let i = 0; i < max_token_name_length - item.token.icrc1_metadata.icrc1_name.length; i++)
            token_name_spaces += ' ';
        let decimals_spaces = '';
        for (let i = 0; i < max_decimals_length - item.token.icrc1_metadata.icrc1_decimals.length; i++)
            decimals_spaces += ' ';
        let fee_spaces = '';
        for (let i = 0; i < max_fee_length - format_fee(item.token.icrc1_metadata.icrc1_fee).length; i++)
            fee_spaces += ' ';
        console.log(
            `TokenInfo::new("${item.token.ledger_canister_id}", "${item.token.icrc1_metadata.icrc1_name}",${token_name_spaces} "${item.token.icrc1_metadata.icrc1_symbol}",${token_info_spaces} ${decimals_spaces}${item.token.icrc1_metadata.icrc1_decimals}, ${fee_spaces}${format_fee(item.token.icrc1_metadata.icrc1_fee)}, false), // fee ${BigNumber(
                item.token.icrc1_metadata.icrc1_fee,
            )
                .div(BigNumber(10).pow(BigNumber(item.token.icrc1_metadata.icrc1_decimals)))
                .toFixed()} ${item.token.icrc1_metadata.icrc1_symbol}`,
        );
    }
};

main();
