import type { ApprovedIcRecord } from './approved/approved_ic';
import type { ConnectedRecord } from './connected';
import type { TokenTransferredIcRecord } from './token/transferred_ic';

export type FuseRecord =
    | { connected: ConnectedRecord }
    | { token_transferred_ic: TokenTransferredIcRecord }
    | { approved_ic: ApprovedIcRecord };

// <prefix>:record:<date> => FuseRecord[]
export type FuseRecordList = FuseRecord[];

export const match_fuse_record = <T>(
    self: FuseRecord,
    {
        connected,
        token_transferred_ic,
        approved_ic,
    }: {
        connected: (connected: ConnectedRecord) => T;
        token_transferred_ic: (token_transferred_ic: TokenTransferredIcRecord) => T;
        approved_ic: (approved_ic: ApprovedIcRecord) => T;
    },
): T => {
    if ('connected' in self) return connected(self.connected);
    if ('token_transferred_ic' in self) return token_transferred_ic(self.token_transferred_ic);
    if ('approved_ic' in self) return approved_ic(self.approved_ic);
    throw new Error('unknown fuse record');
};

export const match_fuse_record_async = async <T>(
    self: FuseRecord,
    {
        connected,
        token_transferred_ic,
        approved_ic,
    }: {
        connected: (connected: ConnectedRecord) => Promise<T>;
        token_transferred_ic: (token_transferred_ic: TokenTransferredIcRecord) => Promise<T>;
        approved_ic: (approved_ic: ApprovedIcRecord) => Promise<T>;
    },
): Promise<T> => {
    if ('connected' in self) return connected(self.connected);
    if ('token_transferred_ic' in self) return token_transferred_ic(self.token_transferred_ic);
    if ('approved_ic' in self) return approved_ic(self.approved_ic);
    throw new Error('unknown fuse record');
};

export const get_fuse_record_created = (record: FuseRecord): number => {
    return match_fuse_record(record, {
        connected: (connected) => connected.created,
        token_transferred_ic: (token_transferred_ic) => token_transferred_ic.created,
        approved_ic: (approved_ic) => approved_ic.created,
    });
};
