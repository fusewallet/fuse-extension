import * as argon2 from '@choptop/argon2-react'; // 83k

export const check_password = (password: string) => {
    return /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{8,32}$/.test(password);
};

export const hash_password = async (password: string) => {
    // // ! The dynamic import module avoids page stalling caused by loading large files
    // const argon2 = await import('@choptop/argon2-react');

    return argon2.hash(password, password);
};

export const verify_password = async (password_hashed: string, password: string): Promise<boolean> => {
    // // ! The dynamic import module avoids page stalling caused by loading large files
    // const argon2 = await import('@choptop/argon2-react');

    try {
        return await argon2.verify(password_hashed, password, password);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        // console.debug('verify password failed: ', e);
        return false;
    }
};
