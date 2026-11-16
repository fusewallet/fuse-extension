export const SettingsGroup = ({ className, children }: { className?: string; children: React.ReactNode }) => {
    return (
        <div className={className ?? 'mt-4 w-full px-5'}>
            <div className="flex flex-col overflow-hidden rounded-xl bg-[#181818]">{children}</div>
        </div>
    );
};
