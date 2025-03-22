// An extension's background service worker is powerful because it runs in the service worker context(opens in a new tab).
// For example, when in this context, you no longer need to worry about CORS and can fetch resources from any origin.
// It is also common to offload heavy computation to the background service worker.

import { sendToContentScript } from '@plasmohq/messaging';

import type { NotificationMessage } from '~lib/messages';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // TODO open survey when uninstall
        // chrome.runtime.setUninstallURL('https://example.com/extension-survey');

        chrome.runtime.openOptionsPage();
        // chrome.tabs.create({ url: './tabs/delta-flyer.html' });
        // chrome.tabs.create({ url: chrome.runtime.getURL('pages/NewPage.html') })
    }
});

console.log(
    'Live now; make now always the most precious time. Now will never come again.',
    process.env.PLASMO_PUBLIC_SITE_URL,
    process.env.NODE_ENV,
);

// Function to broadcast a message to all tabs
async function broadcastMessage(message: NotificationMessage) {
    try {
        // Retrieve all tabs
        const tabs = await chrome.tabs.query({});

        // Send the message to each tab
        for (const tab of tabs) {
            if (tab.id !== undefined) {
                sendToContentScript({
                    tabId: tab.id,
                    name: message.target,
                    body: message,
                }).catch((err) => console.error(`Failed to send message to tab ${tab.id}:`, err));
            }
        }
    } catch (error) {
        console.error('Failed to broadcast message:', error);
        throw error;
    }
}

export { broadcastMessage };
