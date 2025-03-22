import type { PermissionState } from '@slide-computer/signer';

export type ApprovedState =
    | PermissionState // "denied" | "ask_on_use" | "granted"
    | { denied_session: number }
    | { granted_session: number }
    | { denied_expired: { created: number; duration: number } }
    | { granted_expired: { created: number; duration: number } };

export const match_approved_state = <T>(
    self: ApprovedState,
    {
        denied,
        ask_on_use,
        granted,
        denied_session,
        granted_session,
        denied_expired,
        granted_expired,
    }: {
        denied: () => T;
        ask_on_use: () => T;
        granted: () => T;
        denied_session: (session: number) => T;
        granted_session: (session: number) => T;
        denied_expired: (expired: { created: number; duration: number }) => T;
        granted_expired: (expired: { created: number; duration: number }) => T;
    },
): T => {
    if (self === 'denied') return denied();
    if (self === 'ask_on_use') return ask_on_use();
    if (self === 'granted') return granted();
    if (typeof self === 'object') {
        if ('denied_session' in self) return denied_session(self.denied_session);
        if ('granted_session' in self) return granted_session(self.granted_session);
        if ('denied_expired' in self) return denied_expired(self.denied_expired);
        if ('granted_expired' in self) return granted_expired(self.granted_expired);
    }
    throw new Error(`Unknown connected app state: ${JSON.stringify(self)}`);
};

export const match_approved_state_async = async <T>(
    self: ApprovedState,
    {
        denied,
        ask_on_use,
        granted,
        denied_session,
        granted_session,
        denied_expired,
        granted_expired,
    }: {
        denied: () => Promise<T>;
        ask_on_use: () => Promise<T>;
        granted: () => Promise<T>;
        denied_session: (session: number) => Promise<T>;
        granted_session: (session: number) => Promise<T>;
        denied_expired: (expired: { created: number; duration: number }) => Promise<T>;
        granted_expired: (expired: { created: number; duration: number }) => Promise<T>;
    },
): Promise<T> => {
    if (self === 'denied') return denied();
    if (self === 'ask_on_use') return ask_on_use();
    if (self === 'granted') return granted();
    if (typeof self === 'object') {
        if ('denied_session' in self) return denied_session(self.denied_session);
        if ('granted_session' in self) return granted_session(self.granted_session);
        if ('denied_expired' in self) return denied_expired(self.denied_expired);
        if ('granted_expired' in self) return granted_expired(self.granted_expired);
    }
    throw new Error(`Unknown connected app state: ${JSON.stringify(self)}`);
};
