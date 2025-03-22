import type { PlasmoMessaging } from '@plasmohq/messaging';

import { get_cached_data } from '~hooks/store/local';
import type { MessageResult } from '~lib/messages';

export interface RequestBody {
    origin: string;
}
export type ResponseBody = MessageResult<string, string>;

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    const { origin } = req.body ?? { origin: undefined };
    if (!origin) return res.send({ err: 'origin is undefined' });

    // get favicon
    const url = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=64`;

    // console.debug(`🚀 ~ handle get favicon from background ~ url:`, url);

    (async (): Promise<string | undefined> => {
        const data = await get_cached_data(`favicon:${origin}`, async () => {
            const response = await fetch(url);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            return new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
            });
        });
        return data;
    })()
        .then((data) => {
            if (data !== undefined) res.send({ ok: data });
            else res.send({ err: 'favicon not found' });
        })
        .catch((e) => res.send({ err: `${e}` }));
};

export default handler;
