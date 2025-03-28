export class FuseLock {
    private locked = false;

    async lock<T>(callback: () => Promise<T>): Promise<T> {
        if (this.locked) {
            await new Promise((resolve) => setTimeout(resolve, 33));
            return this.lock(callback);
        }
        this.locked = true;
        try {
            return await callback();
        } finally {
            this.locked = false;
        }
    }
}
