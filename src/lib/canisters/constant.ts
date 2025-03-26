import { IcTokenStandard } from "~types/tokens/chain/ic";

export const IC_STANDARDS: Record<IcTokenStandard, [string, string][]> = {
    [IcTokenStandard.ICRC1]: [
        ['icrc1_transfer',            '(record { amount : nat; created_at_time : opt nat64; fee : opt nat; from_subaccount : opt vec nat8; memo : opt vec nat8; to : record { owner : principal; subaccount : opt vec nat8 } }) -> (variant { Err : variant { BadBurn : record { min_burn_amount : nat }; BadFee : record { expected_fee : nat }; CreatedInFuture : record { ledger_time : nat64 }; Duplicate : record { duplicate_of : nat }; GenericError : record { error_code : nat; message : text }; InsufficientFunds : record { balance : nat }; TemporarilyUnavailable; TooOld }; Ok : nat })'],
        ['icrc1_total_supply',        '() -> (nat) query'],
        ['icrc1_balance_of',          '(record { owner : principal; subaccount : opt vec nat8 }) -> (nat) query'],
        ['icrc1_supported_standards', '() -> (vec record { name : text; url : text }) query'],
        ['icrc1_symbol',              '() -> (text) query'],
        ['icrc1_decimals',            '() -> (nat8) query'],
        ['icrc1_minting_account',     '() -> (opt record { owner : principal; subaccount : opt vec nat8 }) query'],
        ['icrc1_metadata',            '() -> (vec record { text; variant { Blob : vec nat8; Int : int; Nat : nat; Text : text } }) query'],
        ['icrc1_name',                '() -> (text) query'],
        ['icrc1_fee',                 '() -> (nat) query'],
    ],
    [IcTokenStandard.ICRC2]: [
        ['icrc2_approve',             '(record { amount : nat; created_at_time : opt nat64; expected_allowance : opt nat; expires_at : opt nat64; fee : opt nat; from_subaccount : opt vec nat8; memo : opt vec nat8; spender : record { owner : principal; subaccount : opt vec nat8 } }) -> (variant { Err : variant { AllowanceChanged : record { current_allowance : nat }; BadFee : record { expected_fee : nat }; CreatedInFuture : record { ledger_time : nat64 }; Duplicate : record { duplicate_of : nat }; Expired : record { ledger_time : nat64 }; GenericError : record { error_code : nat; message : text }; InsufficientFunds : record { balance : nat }; TemporarilyUnavailable; TooOld }; Ok : nat })'],
        ['icrc2_transfer_from',       '(record { amount : nat; created_at_time : opt nat64; fee : opt nat; from : record { owner : principal; subaccount : opt vec nat8 }; memo : opt vec nat8; spender_subaccount : opt vec nat8; to : record { owner : principal; subaccount : opt vec nat8 } }) -> (variant { Err : variant { BadBurn : record { min_burn_amount : nat }; BadFee : record { expected_fee : nat }; CreatedInFuture : record { ledger_time : nat64 }; Duplicate : record { duplicate_of : nat }; GenericError : record { error_code : nat; message : text }; InsufficientAllowance : record { allowance : nat }; InsufficientFunds : record { balance : nat }; TemporarilyUnavailable; TooOld }; Ok : nat })'],
        ['icrc2_allowance',           '(record { account : record { owner : principal; subaccount : opt vec nat8 }; spender : record { owner : principal; subaccount : opt vec nat8 } }) -> (record { allowance : nat; expires_at : opt nat64 }) query'],
        ['icrc1_supported_standards', '() -> (vec record { name : text; url : text }) query'],
    ],
};
