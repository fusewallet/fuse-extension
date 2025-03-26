import { toast as sonner_toast } from 'sonner';

export const useSonnerToast = (): typeof sonner_toast => {
    return sonner_toast;
};
