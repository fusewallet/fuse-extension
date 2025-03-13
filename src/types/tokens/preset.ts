// prettier-ignore // cSpell:words eurc dogmi dolr elna goldao icvc kinic motoko nfidw sneed trax yuku draggin icpcc neutrinite nfid origyn
import { is_same_token_info, match_combined_token_info_async, TokenTag, type CombinedTokenInfo, type TokenInfo } from ".";
import { IcTokenStandard, type IcTokenInfo } from "./ic";
import { get_cached_data } from "~hooks/store/local";
import { evm_get_logo_uri, type EvmTokenInfo } from './evm';
// IC
import TOKEN_IC_ICP_SVG from 'data-base64:~assets/svg/tokens/ic/ICP.min.svg';
// CK
import TOKEN_IC_CK_BTC_SVG    from 'data-base64:~assets/svg/tokens/ic/ck/ckBTC.min.svg';
import TOKEN_IC_CK_USDT_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckUSDT.min.svg';
import TOKEN_IC_CK_USDC_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckUSDC.min.svg';
import TOKEN_IC_CK_ETH_SVG    from 'data-base64:~assets/svg/tokens/ic/ck/ckETH.min.svg';
import TOKEN_IC_CK_LINK_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckLINK.min.svg';
import TOKEN_IC_CK_OCT_SVG    from 'data-base64:~assets/svg/tokens/ic/ck/ckOCT.min.svg';
import TOKEN_IC_CK_PEPE_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckPEPE.min.svg';
import TOKEN_IC_CK_EURC_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckEURC.min.svg';
import TOKEN_IC_CK_SHIB_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckSHIB.min.svg';
import TOKEN_IC_CK_XAUT_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckXAUT.min.svg';
import TOKEN_IC_CK_WSTETH_SVG from 'data-base64:~assets/svg/tokens/ic/ck/ckWSTETH.min.svg';
import TOKEN_IC_CK_UNI_SVG    from 'data-base64:~assets/svg/tokens/ic/ck/ckUNI.min.svg';
import TOKEN_IC_CK_WBTC_SVG   from 'data-base64:~assets/svg/tokens/ic/ck/ckWBTC.min.svg';
// SNS
import TOKEN_IC_SNS_CHAT_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/CHAT.png';
import TOKEN_IC_SNS_KINIC_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/KINIC.png';
import TOKEN_IC_SNS_DOLR_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/DOLR.png';
import TOKEN_IC_SNS_GHOST_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/GHOST.png';
import TOKEN_IC_SNS_DCD_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/DCD.png';
import TOKEN_IC_SNS_CTZ_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/CTZ.png';
import TOKEN_IC_SNS_BOOM_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/BOOM.png';
import TOKEN_IC_SNS_SEER_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/SEER.png';
import TOKEN_IC_SNS_NUA_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/NUA.png';
import TOKEN_IC_SNS_SONIC_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/SONIC.png';
import TOKEN_IC_SNS_GOLDAO_PNG from 'data-base64:~assets/svg/tokens/ic/sns/GOLDAO.png';
import TOKEN_IC_SNS_TRAX_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/TRAX.png';
import TOKEN_IC_SNS_NTN_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/NTN.png';
import TOKEN_IC_SNS_SNEED_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/SNEED.png';
import TOKEN_IC_SNS_ICL_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/ICL.png';
import TOKEN_IC_SNS_ELNA_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/ELNA.png';
import TOKEN_IC_SNS_FPL_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/FPL.png';
import TOKEN_IC_SNS_PANDA_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/PANDA.png';
import TOKEN_IC_SNS_ICS_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/ICS.png';
import TOKEN_IC_SNS_YUKU_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/YUKU.png';
import TOKEN_IC_SNS_EST_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/EST.png';
import TOKEN_IC_SNS_MOTOKO_PNG from 'data-base64:~assets/svg/tokens/ic/sns/MOTOKO.png';
import TOKEN_IC_SNS_CONF_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/CONF.png';
import TOKEN_IC_SNS_OGY_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/OGY.png';
import TOKEN_IC_SNS_WTN_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/WTN.png';
import TOKEN_IC_SNS_____PNG    from 'data-base64:~assets/svg/tokens/ic/sns/---.png';
import TOKEN_IC_SNS_DOGMI_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/DOGMI.png';
import TOKEN_IC_SNS_ICVC_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/ICVC.png';
import TOKEN_IC_SNS_KONG_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/KONG.png';
import TOKEN_IC_SNS_WELL_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/WELL.png';
import TOKEN_IC_SNS_ALICE_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/ALICE.png';
import TOKEN_IC_SNS_NFIDW_PNG  from 'data-base64:~assets/svg/tokens/ic/sns/NFIDW.png';
import TOKEN_IC_SNS_FUEL_PNG   from 'data-base64:~assets/svg/tokens/ic/sns/FUEL.png';
import TOKEN_IC_SNS_ICE_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/ICE.png';
import TOKEN_IC_SNS_DKP_PNG    from 'data-base64:~assets/svg/tokens/ic/sns/DKP.png';
import { mainnet, sepolia } from 'viem/chains';
import type { ChainEvmNetwork, ChainNetwork } from '~types/network';
import { match_chain } from '~types/chain';


const PRESET_LOGO: Record<string, string> = {
    'ic#ryjl3-tyaaa-aaaaa-aaaba-cai': TOKEN_IC_ICP_SVG,
    // CK
    'ic#mxzaz-hqaaa-aaaar-qaada-cai': TOKEN_IC_CK_BTC_SVG,
    'ic#cngnf-vqaaa-aaaar-qag4q-cai': TOKEN_IC_CK_USDT_SVG,
    'ic#xevnm-gaaaa-aaaar-qafnq-cai': TOKEN_IC_CK_USDC_SVG,
    'ic#ss2fx-dyaaa-aaaar-qacoq-cai': TOKEN_IC_CK_ETH_SVG,
    'ic#g4tto-rqaaa-aaaar-qageq-cai': TOKEN_IC_CK_LINK_SVG,
    'ic#ebo5g-cyaaa-aaaar-qagla-cai': TOKEN_IC_CK_OCT_SVG,
    'ic#etik7-oiaaa-aaaar-qagia-cai': TOKEN_IC_CK_PEPE_SVG,
    'ic#pe5t5-diaaa-aaaar-qahwa-cai': TOKEN_IC_CK_EURC_SVG,
    'ic#fxffn-xiaaa-aaaar-qagoa-cai': TOKEN_IC_CK_SHIB_SVG,
    'ic#nza5v-qaaaa-aaaar-qahzq-cai': TOKEN_IC_CK_XAUT_SVG,
    'ic#j2tuh-yqaaa-aaaar-qahcq-cai': TOKEN_IC_CK_WSTETH_SVG,
    'ic#ilzky-ayaaa-aaaar-qahha-cai': TOKEN_IC_CK_UNI_SVG,
    'ic#bptq2-faaaa-aaaar-qagxq-cai': TOKEN_IC_CK_WBTC_SVG,
    // SNS
    'ic#2ouva-viaaa-aaaaq-aaamq-cai': TOKEN_IC_SNS_CHAT_PNG,
    'ic#73mez-iiaaa-aaaaq-aaasq-cai': TOKEN_IC_SNS_KINIC_PNG,
    'ic#6rdgd-kyaaa-aaaaq-aaavq-cai': TOKEN_IC_SNS_DOLR_PNG,
    'ic#4c4fd-caaaa-aaaaq-aaa3a-cai': TOKEN_IC_SNS_GHOST_PNG,
    'ic#xsi2v-cyaaa-aaaaq-aabfq-cai': TOKEN_IC_SNS_DCD_PNG,
    'ic#uf2wh-taaaa-aaaaq-aabna-cai': TOKEN_IC_SNS_CTZ_PNG,
    'ic#vtrom-gqaaa-aaaaq-aabia-cai': TOKEN_IC_SNS_BOOM_PNG,
    'ic#rffwt-piaaa-aaaaq-aabqq-cai': TOKEN_IC_SNS_SEER_PNG,
    'ic#rxdbk-dyaaa-aaaaq-aabtq-cai': TOKEN_IC_SNS_NUA_PNG,
    'ic#qbizb-wiaaa-aaaaq-aabwq-cai': TOKEN_IC_SNS_SONIC_PNG,
    'ic#tyyy3-4aaaa-aaaaq-aab7a-cai': TOKEN_IC_SNS_GOLDAO_PNG,
    'ic#emww2-4yaaa-aaaaq-aacbq-cai': TOKEN_IC_SNS_TRAX_PNG,
    'ic#f54if-eqaaa-aaaaq-aacea-cai': TOKEN_IC_SNS_NTN_PNG,
    'ic#hvgxa-wqaaa-aaaaq-aacia-cai': TOKEN_IC_SNS_SNEED_PNG,
    'ic#hhaaz-2aaaa-aaaaq-aacla-cai': TOKEN_IC_SNS_ICL_PNG,
    'ic#gemj7-oyaaa-aaaaq-aacnq-cai': TOKEN_IC_SNS_ELNA_PNG,
    'ic#ddsp7-7iaaa-aaaaq-aacqq-cai': TOKEN_IC_SNS_FPL_PNG,
    'ic#druyg-tyaaa-aaaaq-aactq-cai': TOKEN_IC_SNS_PANDA_PNG,
    'ic#ca6gz-lqaaa-aaaaq-aacwa-cai': TOKEN_IC_SNS_ICS_PNG,
    'ic#atbfz-diaaa-aaaaq-aacyq-cai': TOKEN_IC_SNS_YUKU_PNG,
    'ic#bliq2-niaaa-aaaaq-aac4q-cai': TOKEN_IC_SNS_EST_PNG,
    'ic#k45jy-aiaaa-aaaaq-aadcq-cai': TOKEN_IC_SNS_MOTOKO_PNG,
    'ic#lrtnw-paaaa-aaaaq-aadfa-cai': TOKEN_IC_SNS_CONF_PNG,
    'ic#lkwrt-vyaaa-aaaaq-aadhq-cai': TOKEN_IC_SNS_OGY_PNG,
    'ic#jcmow-hyaaa-aaaaq-aadlq-cai': TOKEN_IC_SNS_WTN_PNG,
    'ic#itgqj-7qaaa-aaaaq-aadoa-cai': TOKEN_IC_SNS_____PNG,
    'ic#np5km-uyaaa-aaaaq-aadrq-cai': TOKEN_IC_SNS_DOGMI_PNG,
    'ic#m6xut-mqaaa-aaaaq-aadua-cai': TOKEN_IC_SNS_ICVC_PNG,
    'ic#o7oak-iyaaa-aaaaq-aadzq-cai': TOKEN_IC_SNS_KONG_PNG,
    'ic#o4zzi-qaaaa-aaaaq-aaeeq-cai': TOKEN_IC_SNS_WELL_PNG,
    'ic#oj6if-riaaa-aaaaq-aaeha-cai': TOKEN_IC_SNS_ALICE_PNG,
    'ic#mih44-vaaaa-aaaaq-aaekq-cai': TOKEN_IC_SNS_NFIDW_PNG,
    'ic#nfjys-2iaaa-aaaaq-aaena-cai': TOKEN_IC_SNS_FUEL_PNG,
    'ic#ifwyg-gaaaa-aaaaq-aaeqq-cai': TOKEN_IC_SNS_ICE_PNG,
    'ic#zfcdd-tqaaa-aaaaq-aaaga-cai': TOKEN_IC_SNS_DKP_PNG,
}

export const get_token_logo_key = (token: {ic: {canister_id: string}}|{evm: {address: string, chainId: number}}): string => {
    if ('ic' in token) return `token:ic:${token.ic.canister_id}:logo`;
    if ('evm' in token) return `token:evm:${token.evm.address}:${token.evm.chainId}:logo`;
    throw new Error('Invalid token');
}

export const get_token_logo = async (info: CombinedTokenInfo): Promise<string | undefined> => {
    return match_combined_token_info_async(info, {
        ic: async (ic) => {
            const preset = PRESET_LOGO[`ic#${ic.canister_id}`]
            if (preset) return preset;
            const key = get_token_logo_key({ic: {canister_id: ic.canister_id}})
            return get_cached_data(key, async () => undefined, 1000 * 60 * 60 * 24  * 365 * 100)
        },
        evm: async (evm) => {
           return evm_get_logo_uri(evm.address, evm.chainId)
        },
    });

}

const TOKEN_INFO_IC_ICP : IcTokenInfo = { canister_id: 'ryjl3-tyaaa-aaaaa-aaaba-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Internet Computer', symbol: 'ICP', decimals:  8, fee: '10000' }; // fee 0.0001 ICP
// CK
const TOKEN_INFO_IC_CK_BTC    : IcTokenInfo = { canister_id: 'mxzaz-hqaaa-aaaar-qaada-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckBTC',    symbol: 'ckBTC',    decimals:  8, fee:                     '10' }; // fee 0.0000001 ckBTC
const TOKEN_INFO_IC_CK_USDT   : IcTokenInfo = { canister_id: 'cngnf-vqaaa-aaaar-qag4q-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckUSDT',   symbol: 'ckUSDT',   decimals:  6, fee:                  '10000' }; // fee 0.01 ckUSDT
const TOKEN_INFO_IC_CK_USDC   : IcTokenInfo = { canister_id: 'xevnm-gaaaa-aaaar-qafnq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckUSDC',   symbol: 'ckUSDC',   decimals:  6, fee:                  '10000' }; // fee 0.01 ckUSDC
const TOKEN_INFO_IC_CK_ETH    : IcTokenInfo = { canister_id: 'ss2fx-dyaaa-aaaar-qacoq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckETH',    symbol: 'ckETH',    decimals: 18, fee:          '2000000000000' }; // fee 0.000002 ckETH
const TOKEN_INFO_IC_CK_LINK   : IcTokenInfo = { canister_id: 'g4tto-rqaaa-aaaar-qageq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckLINK',   symbol: 'ckLINK',   decimals: 18, fee:        '100000000000000' }; // fee 0.0001 ckLINK
const TOKEN_INFO_IC_CK_OCT    : IcTokenInfo = { canister_id: 'ebo5g-cyaaa-aaaar-qagla-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckOCT',    symbol: 'ckOCT',    decimals: 18, fee:      '34000000000000000' }; // fee 0.034 ckOCT
const TOKEN_INFO_IC_CK_PEPE   : IcTokenInfo = { canister_id: 'etik7-oiaaa-aaaar-qagia-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckPEPE',   symbol: 'ckPEPE',   decimals: 18, fee: '1000000000000000000000' }; // fee 1000 ckPEPE
const TOKEN_INFO_IC_CK_EURC   : IcTokenInfo = { canister_id: 'pe5t5-diaaa-aaaar-qahwa-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckEURC',   symbol: 'ckEURC',   decimals:  6, fee:                  '10000' }; // fee 0.01 ckEURC
const TOKEN_INFO_IC_CK_SHIB   : IcTokenInfo = { canister_id: 'fxffn-xiaaa-aaaar-qagoa-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckSHIB',   symbol: 'ckSHIB',   decimals: 18, fee:  '100000000000000000000' }; // fee 100 ckSHIB
const TOKEN_INFO_IC_CK_XAUT   : IcTokenInfo = { canister_id: 'nza5v-qaaaa-aaaar-qahzq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckXAUT',   symbol: 'ckXAUT',   decimals:  6, fee:                      '1' }; // fee 0.000001 ckXAUT
const TOKEN_INFO_IC_CK_WSTETH : IcTokenInfo = { canister_id: 'j2tuh-yqaaa-aaaar-qahcq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckWSTETH', symbol: 'ckWSTETH', decimals: 18, fee:          '1000000000000' }; // fee 0.000001 ckWSTETH
const TOKEN_INFO_IC_CK_UNI    : IcTokenInfo = { canister_id: 'ilzky-ayaaa-aaaar-qahha-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckUNI',    symbol: 'ckUNI',    decimals: 18, fee:       '1000000000000000' }; // fee 0.001 ckUNI
const TOKEN_INFO_IC_CK_WBTC   : IcTokenInfo = { canister_id: 'bptq2-faaaa-aaaar-qagxq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ckWBTC',   symbol: 'ckWBTC',   decimals:  8, fee:                     '10' }; // fee 0.0000001 ckWBTC
// SNS
const TOKEN_INFO_IC_SNS_CHAT   : IcTokenInfo = { canister_id: '2ouva-viaaa-aaaaq-aaamq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'CHAT',                 symbol: 'CHAT',   decimals: 8, fee:              '100000' }; // fee 0.001 CHAT
const TOKEN_INFO_IC_SNS_KINIC  : IcTokenInfo = { canister_id: '73mez-iiaaa-aaaaq-aaasq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'KINIC',                symbol: 'KINIC',  decimals: 8, fee:              '100000' }; // fee 0.001 KINIC
const TOKEN_INFO_IC_SNS_DOLR   : IcTokenInfo = { canister_id: '6rdgd-kyaaa-aaaaq-aaavq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'DOLR AI',              symbol: 'DOLR',   decimals: 8, fee:              '100000' }; // fee 0.001 DOLR
const TOKEN_INFO_IC_SNS_GHOST  : IcTokenInfo = { canister_id: '4c4fd-caaaa-aaaaq-aaa3a-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'GHOST',                symbol: 'GHOST',  decimals: 8, fee:           '100000000' }; // fee 1 GHOST
const TOKEN_INFO_IC_SNS_DCD    : IcTokenInfo = { canister_id: 'xsi2v-cyaaa-aaaaq-aabfq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'DecideAI',             symbol: 'DCD',    decimals: 8, fee:               '10000' }; // fee 0.0001 DCD
const TOKEN_INFO_IC_SNS_CTZ    : IcTokenInfo = { canister_id: 'uf2wh-taaaa-aaaaq-aabna-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'CatalyzeDAO',          symbol: 'CTZ',    decimals: 8, fee:              '100000' }; // fee 0.001 CTZ
const TOKEN_INFO_IC_SNS_BOOM   : IcTokenInfo = { canister_id: 'vtrom-gqaaa-aaaaq-aabia-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'BoomDAO',              symbol: 'BOOM',   decimals: 8, fee:              '100000' }; // fee 0.001 BOOM
const TOKEN_INFO_IC_SNS_SEER   : IcTokenInfo = { canister_id: 'rffwt-piaaa-aaaaq-aabqq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Seers',                symbol: 'SEER',   decimals: 8, fee:              '100000' }; // fee 0.001 SEER
const TOKEN_INFO_IC_SNS_NUA    : IcTokenInfo = { canister_id: 'rxdbk-dyaaa-aaaaq-aabtq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Nuance',               symbol: 'NUA',    decimals: 8, fee:              '100000' }; // fee 0.001 NUA
const TOKEN_INFO_IC_SNS_SONIC  : IcTokenInfo = { canister_id: 'qbizb-wiaaa-aaaaq-aabwq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Sonic',                symbol: 'SONIC',  decimals: 8, fee:              '100000' }; // fee 0.001 SONIC
const TOKEN_INFO_IC_SNS_GOLDAO : IcTokenInfo = { canister_id: 'tyyy3-4aaaa-aaaaq-aab7a-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'GOLDAO',               symbol: 'GOLDAO', decimals: 8, fee:              '100000' }; // fee 0.001 GOLDAO
const TOKEN_INFO_IC_SNS_TRAX   : IcTokenInfo = { canister_id: 'emww2-4yaaa-aaaaq-aacbq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'TRAX',                 symbol: 'TRAX',   decimals: 8, fee:              '100000' }; // fee 0.001 TRAX
const TOKEN_INFO_IC_SNS_NTN    : IcTokenInfo = { canister_id: 'f54if-eqaaa-aaaaq-aacea-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Neutrinite',           symbol: 'NTN',    decimals: 8, fee:               '10000' }; // fee 0.0001 NTN
const TOKEN_INFO_IC_SNS_SNEED  : IcTokenInfo = { canister_id: 'hvgxa-wqaaa-aaaaq-aacia-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Sneed DAO',            symbol: 'SNEED',  decimals: 8, fee:                '1000' }; // fee 0.00001 SNEED
const TOKEN_INFO_IC_SNS_ICL    : IcTokenInfo = { canister_id: 'hhaaz-2aaaa-aaaaq-aacla-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ICLighthouse DAO',     symbol: 'ICL',    decimals: 8, fee:             '1000000' }; // fee 0.01 ICL
const TOKEN_INFO_IC_SNS_ELNA   : IcTokenInfo = { canister_id: 'gemj7-oyaaa-aaaaq-aacnq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ELNA',                 symbol: 'ELNA',   decimals: 8, fee:              '100000' }; // fee 0.001 ELNA
const TOKEN_INFO_IC_SNS_FPL    : IcTokenInfo = { canister_id: 'ddsp7-7iaaa-aaaaq-aacqq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'OpenFPL',              symbol: 'FPL',    decimals: 8, fee:              '100000' }; // fee 0.001 FPL
const TOKEN_INFO_IC_SNS_PANDA  : IcTokenInfo = { canister_id: 'druyg-tyaaa-aaaaq-aactq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ICPanda',              symbol: 'PANDA',  decimals: 8, fee:               '10000' }; // fee 0.0001 PANDA
const TOKEN_INFO_IC_SNS_ICS    : IcTokenInfo = { canister_id: 'ca6gz-lqaaa-aaaaq-aacwa-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ICPSwap Token',        symbol: 'ICS',    decimals: 8, fee:             '1000000' }; // fee 0.01 ICS
const TOKEN_INFO_IC_SNS_YUKU   : IcTokenInfo = { canister_id: 'atbfz-diaaa-aaaaq-aacyq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Yuku AI',              symbol: 'YUKU',   decimals: 8, fee:             '1000000' }; // fee 0.01 YUKU
const TOKEN_INFO_IC_SNS_EST    : IcTokenInfo = { canister_id: 'bliq2-niaaa-aaaaq-aac4q-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ESTATE',               symbol: 'EST',    decimals: 8, fee:              '100000' }; // fee 0.001 EST
const TOKEN_INFO_IC_SNS_MOTOKO : IcTokenInfo = { canister_id: 'k45jy-aiaaa-aaaaq-aadcq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Motoko',               symbol: 'MOTOKO', decimals: 8, fee:           '100000000' }; // fee 1 MOTOKO
const TOKEN_INFO_IC_SNS_CONF   : IcTokenInfo = { canister_id: 'lrtnw-paaaa-aaaaq-aadfa-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ICPCC DAO LLC',        symbol: 'CONF',   decimals: 8, fee:               '10000' }; // fee 0.0001 CONF
const TOKEN_INFO_IC_SNS_OGY    : IcTokenInfo = { canister_id: 'lkwrt-vyaaa-aaaaq-aadhq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ORIGYN',               symbol: 'OGY',    decimals: 8, fee:              '200000' }; // fee 0.002 OGY
const TOKEN_INFO_IC_SNS_WTN    : IcTokenInfo = { canister_id: 'jcmow-hyaaa-aaaaq-aadlq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'WaterNeuron',          symbol: 'WTN',    decimals: 8, fee:             '1000000' }; // fee 0.01 WTN
const TOKEN_INFO_IC_SNS____    : IcTokenInfo = { canister_id: 'itgqj-7qaaa-aaaaq-aadoa-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: '----',                 symbol: '---',    decimals: 8, fee: '1000000000000000000' }; // fee 10000000000 ---
const TOKEN_INFO_IC_SNS_DOGMI  : IcTokenInfo = { canister_id: 'np5km-uyaaa-aaaaq-aadrq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'DOGMI',                symbol: 'DOGMI',  decimals: 8, fee:        '100000000000' }; // fee 1000 DOGMI
const TOKEN_INFO_IC_SNS_ICVC   : IcTokenInfo = { canister_id: 'm6xut-mqaaa-aaaaq-aadua-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ICVC',                 symbol: 'ICVC',   decimals: 8, fee:               '10000' }; // fee 0.0001 ICVC
const TOKEN_INFO_IC_SNS_KONG   : IcTokenInfo = { canister_id: 'o7oak-iyaaa-aaaaq-aadzq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'KongSwap',             symbol: 'KONG',   decimals: 8, fee:               '10000' }; // fee 0.0001 KONG
const TOKEN_INFO_IC_SNS_WELL   : IcTokenInfo = { canister_id: 'o4zzi-qaaaa-aaaaq-aaeeq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'FomoWell',             symbol: 'WELL',   decimals: 8, fee:              '100000' }; // fee 0.001 WELL
const TOKEN_INFO_IC_SNS_ALICE  : IcTokenInfo = { canister_id: 'oj6if-riaaa-aaaaq-aaeha-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ALICE',                symbol: 'ALICE',  decimals: 8, fee:           '500000000' }; // fee 5 ALICE
const TOKEN_INFO_IC_SNS_NFIDW  : IcTokenInfo = { canister_id: 'mih44-vaaaa-aaaaq-aaekq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'NFID Wallet',          symbol: 'NFIDW',  decimals: 8, fee:               '10000' }; // fee 0.0001 NFIDW
const TOKEN_INFO_IC_SNS_FUEL   : IcTokenInfo = { canister_id: 'nfjys-2iaaa-aaaaq-aaena-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'FUEL',                 symbol: 'FUEL',   decimals: 8, fee:              '100000' }; // fee 0.001 FUEL
const TOKEN_INFO_IC_SNS_ICE    : IcTokenInfo = { canister_id: 'ifwyg-gaaaa-aaaaq-aaeqq-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'ICExplorer',           symbol: 'ICE',    decimals: 8, fee:              '100000' }; // fee 0.001 ICE
const TOKEN_INFO_IC_SNS_DKP    : IcTokenInfo = { canister_id: 'zfcdd-tqaaa-aaaaq-aaaga-cai', standards: [IcTokenStandard.ICRC1, IcTokenStandard.ICRC2], name: 'Draggin Karma Points', symbol: 'DKP',    decimals: 8, fee:              '100000' }; // fee 0.001 DKP

// ========================== IC TOKEN INFO ==========================

export const DEFAULT_IC_TOKEN_INFO: TokenInfo[] = [
    { info: { ic: TOKEN_INFO_IC_ICP }, tags: [TokenTag.ChainIc] },
    // CK
    { info: { ic: TOKEN_INFO_IC_CK_BTC  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_ETH  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_USDC }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_USDT }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    // SNS
    { info: { ic: TOKEN_INFO_IC_SNS_CHAT }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ICL  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_OGY  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_KONG }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
];

export const PRESET_IC_ALL_TOKEN_INFO: TokenInfo[] = [
    { info: { ic: TOKEN_INFO_IC_ICP     }, tags: [TokenTag.ChainIc] },
    // CK
    { info: { ic: TOKEN_INFO_IC_CK_BTC    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_USDT   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_USDC   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_ETH    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_LINK   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_OCT    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_PEPE   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_EURC   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_SHIB   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_XAUT   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_WSTETH }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_UNI    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    { info: { ic: TOKEN_INFO_IC_CK_WBTC   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcCk] },
    // SNS
    { info: { ic: TOKEN_INFO_IC_SNS_CHAT   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_KINIC  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_DOLR   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_GHOST  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_DCD    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_CTZ    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_BOOM   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_SEER   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_NUA    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_SONIC  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_GOLDAO }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_TRAX   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_NTN    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_SNEED  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ICL    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ELNA   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_FPL    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_PANDA  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ICS    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_YUKU   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_EST    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_MOTOKO }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_CONF   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_OGY    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_WTN    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS____    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_DOGMI  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ICVC   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_KONG   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_WELL   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ALICE  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_NFIDW  }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_FUEL   }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_ICE    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
    { info: { ic: TOKEN_INFO_IC_SNS_DKP    }, tags: [TokenTag.ChainIc, TokenTag.ChainIcSns] },
];

// ========================== EVM TOKEN INFO ==========================

// Ethereum Mainnet
const TOKEN_INFO_EVM_ETH     : EvmTokenInfo = { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', name: 'Ether',         symbol: 'ETH',   decimals: 18, chainId: mainnet.id, logoURI: evm_get_logo_uri('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', mainnet.id) };
const TOKEN_INFO_EVM_WETH    : EvmTokenInfo = { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether', symbol: 'WETH',  decimals: 18, chainId: mainnet.id, logoURI: evm_get_logo_uri('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', mainnet.id) };
const TOKEN_INFO_EVM_USDC    : EvmTokenInfo = { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin',      symbol: 'USDC',  decimals: 6,  chainId: mainnet.id, logoURI: evm_get_logo_uri('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', mainnet.id) };
const TOKEN_INFO_EVM_USDT    : EvmTokenInfo = { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD',    symbol: 'USDT',  decimals: 6,  chainId: mainnet.id, logoURI: evm_get_logo_uri('0xdAC17F958D2ee523a2206206994597C13D831ec7', mainnet.id) };
const TOKEN_INFO_EVM_DAI     : EvmTokenInfo = { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai',           symbol: 'DAI',   decimals: 18, chainId: mainnet.id, logoURI: evm_get_logo_uri('0x6B175474E89094C44Da98b954EedeAC495271d0F', mainnet.id) };
const TOKEN_INFO_EVM_LINK    : EvmTokenInfo = { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'ChainLink',     symbol: 'LINK',  decimals: 18, chainId: mainnet.id, logoURI: evm_get_logo_uri('0x514910771AF9Ca656af840dff83E8264EcF986CA', mainnet.id) };

// Sepolia Testnet
const TOKEN_INFO_SEP_WETH    : EvmTokenInfo = { address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', name: 'Wrapped Ether', symbol: 'WETH',  decimals: 18, chainId: sepolia.id, logoURI: evm_get_logo_uri('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', sepolia.id) };
const TOKEN_INFO_SEP_USDC    : EvmTokenInfo = { address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', name: 'USD Coin',      symbol: 'USDC',  decimals: 6,  chainId: sepolia.id, logoURI: evm_get_logo_uri('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', sepolia.id) };
const TOKEN_INFO_SEP_USDT    : EvmTokenInfo = { address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', name: 'Tether USD',    symbol: 'USDT',  decimals: 6,  chainId: sepolia.id, logoURI: evm_get_logo_uri('0xdAC17F958D2ee523a2206206994597C13D831ec7', sepolia.id) };
const TOKEN_INFO_SEP_LINK    : EvmTokenInfo = { address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', name: 'ChainLink',     symbol: 'LINK',  decimals: 18, chainId: sepolia.id, logoURI: evm_get_logo_uri('0x514910771AF9Ca656af840dff83E8264EcF986CA', sepolia.id) };
const TOKEN_INFO_SEP_DAI     : EvmTokenInfo = { address: '0x8267cF9254734C6Eb452a7bb9AAF97B392258b21', name: 'Dai',           symbol: 'DAI',   decimals: 18, chainId: sepolia.id, logoURI: evm_get_logo_uri('0x6B175474E89094C44Da98b954EedeAC495271d0F', sepolia.id) };

export const DEFAULT_EVM_TOKEN_INFO: Record<number, TokenInfo[]> = {
    [mainnet.id]: [
        { info: { evm: TOKEN_INFO_EVM_ETH  }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_WETH }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_USDC }, tags: [TokenTag.ChainEvm] },
    ],
    [sepolia.id]: [
        { info: { evm: TOKEN_INFO_SEP_WETH }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_SEP_USDC }, tags: [TokenTag.ChainEvm] },
    ],
};

export const PRESET_EVM_ALL_TOKEN_INFO: Record<number, TokenInfo[]> = {
    [mainnet.id]: [
        { info: { evm: TOKEN_INFO_EVM_ETH     }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_WETH    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_USDC    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_USDT    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_DAI     }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_EVM_LINK    }, tags: [TokenTag.ChainEvm] },
    ],
    [sepolia.id]: [
        { info: { evm: TOKEN_INFO_EVM_ETH     }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_SEP_WETH    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_SEP_USDC    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_SEP_USDT    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_SEP_LINK    }, tags: [TokenTag.ChainEvm] },
        { info: { evm: TOKEN_INFO_SEP_DAI     }, tags: [TokenTag.ChainEvm] },
    ],
};
export const get_default_token_info = (chain_network?: ChainNetwork) => {
    if (!chain_network) return [];
    return match_chain<TokenInfo[]>(chain_network.chain, {
        ic: () => DEFAULT_IC_TOKEN_INFO,
        evm: () => DEFAULT_EVM_TOKEN_INFO[(chain_network as ChainEvmNetwork).chainId]
    })
}
export const get_preset_all_token_info = (chain_network?: ChainNetwork) => {
    if (!chain_network) return [];
    return match_chain<TokenInfo[]>(chain_network.chain, {
        ic: () => PRESET_IC_ALL_TOKEN_INFO,
        evm: () => PRESET_EVM_ALL_TOKEN_INFO[(chain_network as ChainEvmNetwork).chainId]
    })
}
export const is_known_token = (token: TokenInfo): boolean => !!PRESET_IC_ALL_TOKEN_INFO.find(t => is_same_token_info(t, token))
