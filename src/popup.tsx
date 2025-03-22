import { SinglePageApp } from '~components/layouts/app';
import { getRoutes } from '~pages/routes';

// routes of popup page
const routes = getRoutes('popup');

// The popup page is a small dialog window that opens when a user clicks on the extension's icon in the browser toolbar.
// It is the most common type of extension page.
function IndexPopup() {
    return <SinglePageApp className="flex h-[600px] w-[360px] flex-col" routes={routes} />;
}

export default IndexPopup;
