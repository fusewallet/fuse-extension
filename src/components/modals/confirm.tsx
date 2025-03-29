import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~components/ui/alert-dialog';

export const ConfirmModal = ({
    container,
    trigger,
    title,
    description,
    cancel,
    confirm,
}: {
    container?: HTMLElement | null | undefined;
    trigger: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    cancel?: React.ReactNode;
    confirm?: React.ReactNode;
}) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            <AlertDialogContent container={container} className="border-white/50 bg-[#0a0600]">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/40 bg-transparent">
                        {cancel ?? 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction className="hover:border hover:border-[#FFCF13]/70">
                        {confirm ?? 'Confirm'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
