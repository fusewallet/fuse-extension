import type { ProxyMessage } from '@dfinity/agent';

import { parse_factory, stringify_factory } from './json';

const stringify = stringify_factory(JSON.stringify, true);
const parse = parse_factory(JSON.parse);

export const stringify_proxy_message = (msg: ProxyMessage) => stringify(msg);
export const parse_proxy_message = (msg: string): ProxyMessage => parse(msg);
