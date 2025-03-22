import { Actor, ProxyAgent, type ActorSubclass, type Agent, type ProxyMessage } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { v4 as uuid } from 'uuid';

import { relay_message_disconnect } from '~lib/messages/relay/relay-disconnect';
import { relay_message_ic_proxy_agent } from '~lib/messages/relay/relay-ic-proxy-agent';
import { relay_message_is_connected } from '~lib/messages/relay/relay-is-connected';
import { relay_message_request_connect } from '~lib/messages/relay/relay-request-connect';
import { parse_proxy_message, stringify_proxy_message } from '~lib/utils/ic-message';

import { find_favicon } from '../connect';
import { DEFAULT_CALL_TIMEOUT, DEFAULT_TIMEOUT, get_current_window } from './index';

export interface RequestConnectRequest {
    timeout?: number;
    popup?: boolean; // popup if not connected
}
export type RequestConnectResponse = boolean;

export interface IsConnectedRequest {
    timeout?: number;
}
export type IsConnectedResponse = boolean;

export interface DisconnectRequest {
    timeout?: number;
}
export type DisconnectedResponse = undefined;

export interface GetPrincipalRequest {
    timeout?: number;
}
export type GetPrincipalResponse = Principal | undefined;

export interface CreateActorRequest {
    idlFactory: IDL.InterfaceFactory;
    canisterId: string;
    timeout?: number;
}
export type CreateActorResponse<T> = ActorSubclass<T>;

export class FuseClientByIc {
    #get_current_popup: () => boolean;
    #backend(self: FuseClientByIc, msg: ProxyMessage) {
        const agent = self.agent as ProxyAgent;
        const body = stringify_proxy_message(msg);
        console.debug('===>>> 📦 before send message', [msg], '->', [body]);
        const origin = window.location.origin;
        find_favicon(window.document, origin)
            .then((favicon) =>
                relay_message_ic_proxy_agent({
                    request: {
                        origin,
                        title: window.document.title,
                        favicon,
                        request: body,
                    },
                }),
            )
            .then((response) => {
                const msg: ProxyMessage = parse_proxy_message(response);
                console.debug('<<<=== 🎁 got message after sent message', [response], '->', [msg]);
                agent.onmessage(msg);
            });
    }
    #reset_agent(connected: boolean) {
        if (connected && !this.agent) this.agent = new ProxyAgent((body: ProxyMessage) => this.#backend(this, body));
        else if (!connected && this.agent) this.agent = undefined;
    }
    constructor(_get_current_popup: () => boolean) {
        this.#get_current_popup = _get_current_popup;
    }

    // agent is visible
    agent: Agent | undefined;

    // cloud provide address if granted
    async requestConnect(request?: RequestConnectRequest): Promise<RequestConnectResponse> {
        const message_id = uuid();

        // args
        let { timeout, popup } = request ?? {};
        if (timeout === undefined) timeout = DEFAULT_TIMEOUT;
        if (popup === undefined) popup = this.#get_current_popup();

        // which origin request
        const origin = window.location.origin;
        const title = window.document.title;
        const favicon = await find_favicon(window.document, origin);
        // console.error('main world client', origin, title, favicon);

        const connected = await relay_message_request_connect(
            {
                message_id,
                window: await get_current_window(window),
                timeout,
                popup,
                chain: 'ic',
                origin,
                title,
                favicon,
            },
            timeout,
        );

        this.#reset_agent(connected);

        return connected;
    }

    // check connected
    async isConnected(request?: IsConnectedRequest): Promise<IsConnectedResponse> {
        const message_id = uuid();

        // args
        let { timeout } = request ?? {};
        if (timeout === undefined) timeout = DEFAULT_TIMEOUT;

        // which origin request
        const origin = window.location.origin;

        const connected = await relay_message_is_connected(
            {
                message_id,
                window: await get_current_window(window),
                timeout,
                chain: 'ic',
                origin,
            },
            timeout,
        );

        this.#reset_agent(connected);

        return connected;
    }

    // disconnect
    async disconnect(request?: DisconnectRequest): Promise<DisconnectedResponse> {
        const message_id = uuid();

        // args
        let { timeout } = request ?? {};
        if (timeout === undefined) timeout = DEFAULT_TIMEOUT;

        // which origin request
        const origin = window.location.origin;

        await relay_message_disconnect(
            {
                message_id,
                window: await get_current_window(window),
                timeout,
                chain: 'ic',
                origin,
            },
            timeout,
        );

        this.#reset_agent(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getPrincipal(_request?: GetPrincipalRequest): Promise<GetPrincipalResponse> {
        if (!this.agent) return undefined;
        return this.agent.getPrincipal();
    }

    // create actor
    async createActor<T>(request: CreateActorRequest): Promise<CreateActorResponse<T>> {
        // const message_id = uuid();

        // args
        let { timeout } = request;
        if (timeout === undefined) timeout = DEFAULT_CALL_TIMEOUT;
        const { idlFactory, canisterId } = request;

        // which origin request
        const origin = window.location.origin;

        if (!this.agent) throw new Error('disconnected');

        const idl_service = request.idlFactory({ IDL });
        const service: [string, string][] = idl_service._fields.map(([m, func]) => {
            const args = func.argTypes.map((arg) => display_candid(arg)).join(', ');
            const rets = func.retTypes.map((arg) => display_candid(arg)).join(', ');
            const annotations = ' ' + func.annotations.join(' ');
            return [m, `(${args}) -> (${rets})${annotations}`.trim()];
        });
        // console.debug(`🚀 ~ FuseClient ~ service:`, idl_service, service);
        await relay_message_ic_proxy_agent({
            service: {
                window: await get_current_window(window),
                timeout,
                origin,
                canister_id: canisterId,
                service,
            },
        });

        return Actor.createActor(idlFactory, {
            canisterId,
            agent: this.agent,
        });
    }

    // // for
    // async request(config: any): Promise<{}> {
    //     // TODO
    //     console.error('main world client');

    //     return false;
    // }
}

class InnerVisitor extends IDL.Visitor<undefined, string> {
    visitVec<T>(_t: IDL.VecClass<T>, ty: IDL.Type<T>): string {
        return display_candid(ty);
    }
    visitOpt<T>(_t: IDL.OptClass<T>, ty: IDL.Type<T>): string {
        return display_candid(ty);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visitTuple<T extends any[]>(_t: IDL.TupleClass<T>, components: IDL.Type[]): string {
        const _fields = components.map((value) => display_candid(value));
        return _fields.join('; ');
    }
    visitRecord(_t: IDL.RecordClass, fields: [string, IDL.Type][]): string {
        const _fields = fields.map(([key, value]) => wrapped_key_word(key) + ':' + display_candid(value));
        return _fields.join('; ');
    }
    visitVariant(_t: IDL.VariantClass, fields: [string, IDL.Type][]): string {
        const _fields = fields.map(
            ([key, value]) => wrapped_key_word(key) + (value.name === 'null' ? '' : `:${display_candid(value)}`),
        );
        return _fields.join('; ');
    }
}
const visitor = new InnerVisitor();
const display_candid = (ty: IDL.Type): string => {
    const name = ty.name;
    switch (name) {
        case 'empty':
        case 'unknown':
        case 'Unknown':
        case 'bool':
        case 'null':
        case 'reserved':
        case 'text':
        case 'int':
        case 'nat':
        case 'float32':
        case 'float64':
        case 'int8':
        case 'int16':
        case 'int32':
        case 'int64':
        case 'nat8':
        case 'nat16':
        case 'nat32':
        case 'nat64':
        case 'principal':
            return ty.display();
    }
    if (ty instanceof IDL.VecClass) return `vec ${ty.accept(visitor, undefined)}`;
    if (ty instanceof IDL.OptClass) return `opt ${ty.accept(visitor, undefined)}`;
    if (ty instanceof IDL.TupleClass) return `record {${ty.accept(visitor, undefined)}}`;
    if (ty instanceof IDL.RecordClass) return `record {${ty.accept(visitor, undefined)}}`;
    if (ty instanceof IDL.VariantClass) return `variant {${ty.accept(visitor, undefined)}}`;
    if (ty instanceof IDL.RecClass) return ty.display();
    if (ty instanceof IDL.FuncClass) {
        const args = ty.argTypes.map((arg) => display_candid(arg)).join(', ');
        const rets = ty.retTypes.map((arg) => display_candid(arg)).join(', ');
        const annotations = ' ' + ty.annotations.join(' ');
        return `func (${args}) -> (${rets})${annotations}`;
    }
    if (ty instanceof IDL.ServiceClass) {
        const fields = ty._fields.map(([key, value]) => {
            const args = value.argTypes.map((arg) => display_candid(arg)).join(', ');
            const rets = value.retTypes.map((arg) => display_candid(arg)).join(', ');
            const annotations = ' ' + value.annotations.join(' ');
            return key + ':' + ` (${args}) -> (${rets})${annotations}`;
        });
        return `service {${fields.join('; ')}}`;
    }
    throw new Error(`Unknown candid type: ${name}`);
};

const wrapped_key_word = (name: string): string => {
    if (
        (() => {
            switch (name) {
                case 'bool':
                case 'nat':
                case 'int':
                case 'nat8':
                case 'nat16':
                case 'nat32':
                case 'nat64':
                case 'int8':
                case 'int16':
                case 'int32':
                case 'int64':
                case 'float32':
                case 'float64':
                case 'null':
                case 'text':
                case 'principal':
                case 'vec':
                case 'opt':
                case 'record':
                case 'variant':
                // case  "tuple": // not key world
                // eslint-disable-next-line no-fallthrough
                case 'unknown':
                case 'empty':
                case 'reserved':
                case 'func':
                case 'service':
                case 'rec': // maybe
                    return true;
            }
            return false;
        })() ||
        name.includes(' ') ||
        name.includes('-') ||
        name.includes('\\')
    ) {
        return `"${name}"`;
    }
    return name;
};
