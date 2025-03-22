export const useTranslation = (): { t: (key: string) => string } => {
    return {
        t: (key: string) => chrome.i18n.getMessage(key),
    };
};
