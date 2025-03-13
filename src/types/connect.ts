import type { PermissionState } from '@slide-computer/signer';

import { relay_message_get_favicon } from '~lib/messages/relay/relay-get-favicon';

export type ConnectedAppState =
    | PermissionState // "denied" | "ask_on_use" | "granted"
    | { denied_session: number }
    | { granted_session: number }
    | { denied_expired: { created: number; duration: number } }
    | { granted_expired: { created: number; duration: number } };

export interface ConnectedApp {
    created: number; // ms
    origin: string; // window.location.origin
    title: string; // window.document.title
    favicon?: string; // find_favicon
    state: ConnectedAppState; // state
    updated: number; // ms
}

// account => chain:network => origin[]
export type ConnectedApps = ConnectedApp[];

export interface CurrentConnectedApps {
    ic: ConnectedApps;
    evm: ConnectedApps;
}

export const DEFAULT_CURRENT_CONNECTED_APPS: CurrentConnectedApps = { ic: [], evm: [] };

export const update_connected_app = (old: ConnectedApp, app: ConnectedApp) => {
    old.title = app.title;
    old.favicon = app.favicon;
    old.state = app.state;
    old.updated = app.updated;
};

export const match_connected_app_state = <T>(
    self: ConnectedAppState,
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

export const match_connected_app_state_async = async <T>(
    self: ConnectedAppState,
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

export const find_favicon = async (document: Document, origin: string): Promise<string | undefined> => {
    const url = (() => {
        const elements = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
        for (const element of elements) {
            const href: string = (element as any).href;
            if (href) {
                if (!href.startsWith('http')) return `${origin}${href}`;
                return href;
            }
        }
        return undefined;
    })();
    if (!url) return url;

    // base64
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    let data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });

    // check single page application
    if (data.startsWith('data:text/html;base64,')) data = await relay_message_get_favicon(origin);

    return data;
};
