// import type { WrappedCandidType, WrappedCandidTypeService } from '@jellypack/runtime/lib/wasm/candid';

import { IcTokenStandard } from '~types/tokens/chain/ic';

import { IC_STANDARDS } from './constant';

const is_methods_match = (methods: [string, string][], name: string, func: string): boolean => {
    const method = methods.find(([n]) => n === name);
    if (!method) return false;

    if (method[1] !== func) console.error('got difference func but have same name', [method[1], func]);

    return method[1] === func;
};

const is_methods_match_standards = (methods: [string, string][], required: [string, string][]): boolean => {
    for (const [name, func] of required) {
        if (!is_methods_match(methods, name, func)) return false;
    }
    return true;
};

export const get_canister_standards = async (candid: string): Promise<IcTokenStandard[]> => {
    // ! The dynamic import module avoids page stalling caused by loading large files
    const { parse_candid_type_to_text, parse_service_candid } = await import('@jellypack/wasm-react');

    const service = await parse_service_candid(candid, (s) => s, false);
    // console.error(`🚀 ~ const get_canister_standards= ~ service:`, service);
    const methods = await Promise.all(
        (service.methods ?? []).map(async ([name, func]): Promise<[string, string]> => {
            return parse_candid_type_to_text({ func }, false).then((func) => {
                return [
                    name,
                    func.substring(5), // trim start 'func '
                ];
            });
        }),
    );
    // console.error(`🚀 ~ const get_canister_standards= ~ methods:`, methods);
    const standards = Object.keys(IC_STANDARDS) as IcTokenStandard[];
    return standards.filter((standard) => is_methods_match_standards(methods, IC_STANDARDS[standard]));
};

// const parse_service_candid = async <T>(
//     candid: string,
//     mapping: (s: WrappedCandidTypeService) => T,
//     debug: boolean,
// ): Promise<T> => {
//     const response = await fetch('https://wasm-api.fusewallet.top/parse_service_candid', {
//         method: 'PUT',
//         body: JSON.stringify({ candid }),
//     });
//     const json = await response.json();
//     if (json.code !== 0) throw new Error(json.message);
//     const data = JSON.parse(json.data.result);
//     if (data.err) throw new Error(data.err);
//     const service = JSON.parse(data.ok);
//     if (debug) console.error('🚀 ~ const parse_service_candid= ~ service:', service);
//     return mapping(service);
// };

// const parse_candid_type_to_text = async (ty: WrappedCandidType, debug: boolean): Promise<string> => {
//     const response = await fetch('https://wasm-api.fusewallet.top/parse_candid_type_to_text', {
//         method: 'PUT',
//         body: JSON.stringify({ ty: JSON.stringify(ty) }),
//     });
//     const json = await response.json();
//     if (json.code !== 0) throw new Error(json.message);
//     const data = JSON.parse(json.data.result);
//     if (debug) console.debug(`🚀 ~ const parse_candid_type_to_text= ~ data:`, data);
//     if (data.err) throw new Error(data.err);
//     return data.ok;
// };
