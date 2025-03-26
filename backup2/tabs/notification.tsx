import { SinglePageApp } from '~components/layouts/app';
import { getRoutes } from '~pages/routes';

// routes of notification page
const routes = getRoutes('notification');

// Tab Pages is a feature unique to the Plasmo framework.
// Unlike Extension Pages, Tab Pages are just regular web pages shipped with your extension bundle.
// Extensions generally redirect to or open these pages programmatically, but you can link to them as well.
// Use Cases
// - A page to show when a user first installs your extension.
// - A dedicated page for authentication
// - When you need a more elaborate routing setup
function NotificationPage() {
    return <SinglePageApp className="flex h-screen w-screen flex-col" routes={routes} />;
}

export default NotificationPage;
