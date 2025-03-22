import { SinglePageApp } from '~components/layouts/app';
import { getRoutes } from '~pages/routes';

// routes of sidepanel page
const routes = getRoutes('popup');

// The Side Panel allows extensions to display their own UI in the side panel,
// enabling persistent experiences that complement the user's browsing journey.
function IndexSidePanel() {
    return <SinglePageApp className="flex h-screen w-screen flex-col" routes={routes} />;
}

export default IndexSidePanel;
