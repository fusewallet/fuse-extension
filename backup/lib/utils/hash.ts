import { Sha256 } from '@aws-crypto/sha256-js';
import { array2hex } from '@choptop/haw';

export const sha256_hash = async (data: string): Promise<string> => {
    const hash = new Sha256();
    hash.update(data);
    const result = await hash.digest();
    return array2hex(result);
};
