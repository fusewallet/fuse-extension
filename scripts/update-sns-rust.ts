import * as fs from 'fs';
import * as path from 'path';
import { anonymous } from '@choptop/haw';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

import { get_token_info_ic } from '~hooks/store/local/token/ic/info';
import { list_sns_canisters } from '~lib/canisters/sns_root';
import type { IcTokenInfo } from '~types/tokens/chain/ic';

type TokenItem = {
    root_canister_id: string;
    name: string;
    url: string;
    logo: string;
    description: string;
    swap_lifecycle: {
        lifecycle: string; // 'LIFECYCLE_COMMITTED'
        decentralization_sale_open_timestamp_seconds: number;
    };
    nns_proposal_id_create_sns: number;
};

const main = async () => {
    const response = await fetch(
        'https://sns-api.internetcomputer.org/api/v1/snses?offset=0&limit=100&include_swap_lifecycle=LIFECYCLE_COMMITTED',
    );
    const json = await response.json();
    let data = json.data as TokenItem[];
    data = _.sortBy(data, (d) => d.swap_lifecycle.decentralization_sale_open_timestamp_seconds);

    // save images
    let items: {
        token: TokenItem;
        ext: string;
        token_info: IcTokenInfo;
        import_logo_name: string;
        token_info_name: string;
    }[] = [];
    for (const d of await Promise.all(
        data
            .filter((d) => d.root_canister_id !== 'u67kc-jyaaa-aaaaq-aabpq-cai')
            .map(async (d) => {
                const canisters = await list_sns_canisters(anonymous, d.root_canister_id);
                if (canisters.ledger === undefined) throw new Error(`ledger canister not found: ${d.root_canister_id}`);
                // const token_info = await get_token_info_ic(canisters.ledger);
                const token_info =
                    canisters.ledger === 'itgqj-7qaaa-aaaaq-aadoa-cai'
                        ? {
                              canister_id: 'itgqj-7qaaa-aaaaq-aadoa-cai',
                              standards: ['icrc1', 'icrc2'],
                              name: '----',
                              symbol: '----',
                              decimals: 8,
                              fee: '1000000000000000000',
                          }
                        : await get_token_info_ic(canisters.ledger);
                if (token_info === undefined) throw new Error(`token info not found: ${d.root_canister_id}`);
                return {
                    ...d,
                    canisters,
                    token_info,
                };
            }),
    )) {
        const logo = d.logo;
        let ext = (() => {
            if (logo.startsWith('data:image/svg+xml')) return 'svg';
            if (logo.startsWith('data:image/png')) return 'png';
            if (logo.startsWith('https://dfinity-dashboard-assets.dashboard.internetcomputer.org/snses/')) return 'png';
            throw new Error(`unknown logo extension: ${logo}`);
        })();
        const token_info = d.token_info;
        const name = `${token_info.symbol}.${ext}`;
        const binary = Buffer.from(logo.replace(/^data:image\/(png|jpeg|jpg|svg\+xml);base64,/, ''), 'base64');
        fs.writeFileSync(path.join(__dirname, '../src/assets/svg/tokens/ic/sns', name), binary);
        const n = token_info.symbol.toUpperCase().replaceAll('-', '_');
        items.push({
            token: d,
            ext,
            token_info,
            import_logo_name: `TOKEN_IC_SNS_${n}_${ext.toUpperCase()}`,
            token_info_name: `TOKEN_INFO_IC_SNS_${n}`,
        });
    }

    // 排序
    items = _.sortBy(items, (item) => item.token_info.canister_id);

    // print token info
    const format_fee = (fee: string) => BigNumber(fee).toFormat({ groupSize: 3, groupSeparator: '_' });
    const max_token_info_length = Math.max(...items.map((item) => item.token_info_name.length));
    const max_token_name_length = Math.max(...items.map((item) => item.token_info.name.length));
    const max_decimals_length = Math.max(...items.map((item) => item.token_info.decimals.toString().length));
    const max_fee_length = Math.max(...items.map((item) => format_fee(item.token_info.fee).length));
    console.log(``);
    console.log(`============== token info ==============`);
    console.log(`// SNS`);
    for (const item of items) {
        let token_info_spaces = '';
        for (let i = 0; i < max_token_info_length - item.token_info_name.length; i++) token_info_spaces += ' ';
        let token_name_spaces = '';
        for (let i = 0; i < max_token_name_length - item.token_info.name.length; i++) token_name_spaces += ' ';
        let decimals_spaces = '';
        for (let i = 0; i < max_decimals_length - item.token_info.decimals.toString().length; i++)
            decimals_spaces += ' ';
        let fee_spaces = '';
        for (let i = 0; i < max_fee_length - format_fee(item.token_info.fee).length; i++) fee_spaces += ' ';
        console.log(
            `TokenInfo::new("${item.token_info.canister_id}", "${item.token_info.name}",${token_name_spaces} "${item.token_info.symbol}",${token_info_spaces} ${decimals_spaces}${item.token_info.decimals}, ${fee_spaces}${format_fee(item.token_info.fee)}, false), // fee ${BigNumber(
                item.token_info.fee,
            )
                .div(BigNumber(10).pow(BigNumber(item.token_info.decimals)))
                .toFixed()} ${item.token_info.symbol}`,
        );
    }
};

main();
