import { useEffect, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Shell } from '@/components/shell';
import { ProgressProvider } from '@/lib/progress';
import HomePage from '@/pages/home';
import AventurePage from '@/pages/aventure';
import WorldPage from '@/pages/world';
import MissionPage from '@/pages/mission';
import EpreuvesPage from '@/pages/epreuves';
import EpreuvePage from '@/pages/epreuve';
import EntrainementPage from '@/pages/entrainement';
import CarnetPage from '@/pages/carnet';
import ParentPage from '@/pages/parent';
import RevisionPage, { RevisionPlay } from '@/pages/revision';
import NotFound from '@/pages/not-found';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/aventure" component={AventurePage} />
        <Route path="/monde/:id">{(p) => <WorldPage key={p.id} />}</Route>
        <Route path="/mission/:id">{(p) => <MissionPage key={p.id} />}</Route>
        <Route path="/epreuves" component={EpreuvesPage} />
        <Route path="/epreuve/:id">{(p) => <EpreuvePage key={p.id} />}</Route>
        <Route path="/entrainement" component={EntrainementPage} />
        <Route path="/carnet" component={CarnetPage} />
        <Route path="/parent" component={ParentPage} />
        <Route path="/revision" component={RevisionPage} />
        <Route path="/revision/jouer" component={RevisionPlay} />
        <Route path="/progression"><Redirect to="/carnet" /></Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  // Remonte en haut de page à chaque changement d'écran
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location]);
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ProgressProvider>
      <WouterRouter {...(import.meta.env.VITE_HASH ? { hook: useHashLocation } : { base: import.meta.env.BASE_URL.replace(/\/$/, '') })}>
        <Shell>
          <Router />
        </Shell>
      </WouterRouter>
    </ProgressProvider>
  );
}

export default App;
