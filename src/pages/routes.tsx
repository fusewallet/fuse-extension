import type { RouteObject } from 'react-router-dom';

import type { WindowType } from '~types/pages';

import ActionsPage from './actions';
import FunctionDappsPage from './functions/dapps';
import FunctionSettingsPage from './functions/settings';
import SettingsAccountsPage from './functions/settings/pages/accounts';
import AccountsSinglePage from './functions/settings/pages/accounts/edit';
import InitialPage from './initial';
import InnerCreatePage from './initial/create';
import CreateRestorePage from './initial/restore';
import LockedPage from './locked';
import WelcomePage from './welcome';
import FunctionSettingsSecurityPage from './functions/settings/pages/security';
import FunctionSettingsSecurityChangePasswordPage from './functions/settings/pages/security/password';
import FunctionSettingsSecurityLockTimePage from './functions/settings/pages/security/lock-time';
import FunctionSettingsSecurityBackupPage from './functions/settings/pages/security/backup';
import FunctionSettingsPreferencesPage from './functions/settings/pages/preferences';
import FunctionSettingsCurrency from './functions/settings/pages/preferences/currency';
import FunctionSettingsLanguage from './functions/settings/pages/preferences/language';
import FunctionSettingsAddressesPage from './functions/settings/pages/address';
import FunctionSettingsConnectedAppPage from './functions/settings/pages/connected';
import FunctionSettingsAboutPage from './functions/settings/pages/about';
import FunctionReceivePage from './functions/receive';
import FunctionSwapPage from './functions/swap';
import FunctionTransferTokenIcPage from './functions/transfer/token/ic';
import FunctionTransferPage from './functions/transfer';
import FunctionTokenIcPage from './functions/token/ic';
import FunctionTokenViewPage from './functions/token/view';
import FunctionSwitchAccountPage from './functions/switch';
import FunctionRecordsPage from './functions/record';
import HomePage from './home';
import ImportExtraAccountPage from './functions/switch/pages/import-extra-account';
import FunctionChainPage from './functions/chains';

export const getRoutes = (wt: WindowType) => {
    const routes: RouteObject[] = [
        ...(hit(wt, []) ? [{ path: '/welcome', element: <WelcomePage /> }] : []),

        // initial
        ...(hit(wt, []) ? [{ path: '/initial', element: <InitialPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/initial/create', element: <InnerCreatePage wt={wt} /> }] : []),
        ...(hit(wt, []) ? [{ path: '/initial/restore', element: <CreateRestorePage wt={wt} /> }] : []),

        // locked
        ...(hit(wt, []) ? [{ path: '/locked', element: <LockedPage wt={wt} /> }] : []),

        // home
        ...(hit(wt, []) ? [{ path: '/', element: <HomePage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home', element: <HomePage /> }] : []),

        // -------------- home header --------------

        // select wallet
        ...(hit(wt, []) ? [{ path: '/home/switch/account', element: <FunctionSwitchAccountPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/switch/account/import/:type', element: <ImportExtraAccountPage /> }] : []),

        // token `gallery
        ...(hit(wt, []) ? [{ path: '/home/token/view', element: <FunctionTokenViewPage   /> }] : []),

        // records
        ...(hit(wt, []) ? [{ path: '/home/records', element: <FunctionRecordsPage   /> }] : []),

        // settings
        // settings/accounts
        ...(hit(wt, []) ? [{ path: '/home/settings', element: <FunctionSettingsPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/accounts', element: <SettingsAccountsPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/accounts/extra', element: <InitialPage extra={true} /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/accounts/extra/create', element: <InnerCreatePage wt={wt} extra={true} /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/accounts/extra/restore', element: <CreateRestorePage wt={wt} extra={true} /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/accounts/import/:type', element: <ImportExtraAccountPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/accounts/:id', element: <AccountsSinglePage /> }] : []),
        // settings/security
        ...(hit(wt, []) ? [{ path: '/home/settings/security', element: <FunctionSettingsSecurityPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/security/password', element: <FunctionSettingsSecurityChangePasswordPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/security/lock-time', element: <FunctionSettingsSecurityLockTimePage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/security/backup', element: <FunctionSettingsSecurityBackupPage /> }] : []),
        // settings/preferences
        ...(hit(wt, []) ? [{ path: '/home/settings/preferences', element: <FunctionSettingsPreferencesPage /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/preferences/currency', element: <FunctionSettingsCurrency /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/settings/preferences/language', element: <FunctionSettingsLanguage /> }] : []),
        // settings/addresses
        ...(hit(wt, []) ? [{ path: '/home/settings/addresses', element: <FunctionSettingsAddressesPage /> }] : []),
        // settings/connected
        ...(hit(wt, []) ? [{ path: '/home/settings/connected', element: <FunctionSettingsConnectedAppPage /> }] : []),
        // settings/about
        ...(hit(wt, []) ? [{ path: '/home/settings/about', element: <FunctionSettingsAboutPage /> }] : []),

        // -------------- home chains --------------

        ...(hit(wt, []) ? [{ path: '/home/chains', element: <FunctionChainPage /> }] : []),

        // -------------- home icons --------------

        // send
        ...(hit(wt, []) ? [{ path: '/home/transfer', element: <FunctionTransferPage   /> }] : []),
        // send token
        ...(hit(wt, []) ? [{ path: '/home/transfer/token/ic', element: <FunctionTransferTokenIcPage   /> }] : []),

        // receive
        ...(hit(wt, []) ? [{ path: '/home/receive', element: <FunctionReceivePage /> }] : []),

        // swap
        ...(hit(wt, []) ? [{ path: '/home/swap', element: <FunctionSwapPage   /> }] : []),

        // dapps
        ...(hit(wt, []) ? [{ path: '/home/dapps', element: <FunctionDappsPage wt={wt} /> }] : []),

        // -------------- home tokens --------------

        // token ic
        ...(hit(wt, []) ? [{ path: '/home/token/ic', element: <FunctionTokenIcPage   /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/token/ic/transfer', element: <FunctionTransferTokenIcPage   /> }] : []),
        ...(hit(wt, []) ? [{ path: '/home/token/ic/receive', element: <FunctionReceivePage   /> }] : []),


        // action
        ...(hit(wt, []) ? [{ path: '/action', element: <ActionsPage wt={wt} /> }] : []),

        // others
        { path: '*', element: <HomePage /> },
    ];
    return routes;
};

const hit = (wt: WindowType, excludes: WindowType[]): boolean => {
    if (excludes.includes(wt)) return false;
    return true;
};
