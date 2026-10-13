import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class Boundary extends React.Component<{ children: React.ReactNode }, { err: boolean; msg: string }> {
  state = { err: false, msg: '' };
  static getDerivedStateFromError(e: unknown) { return { err: true, msg: String((e as Error)?.message ?? e) }; }
  render() { return this.state.err ? <div className="p-8 text-center"><h1 className="text-3xl font-bold mb-3">Oups, quelque chose s’est mal passé</h1><p className="mb-2">Ta progression est sauvegardée.</p><p className="mb-4 text-sm opacity-70">{this.state.msg}</p><button className="btn btn-gold" onClick={() => location.reload()}>Recharger</button></div> : this.props.children; }
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Boundary><App /></Boundary></React.StrictMode>);

// Mode hors connexion : enregistrement silencieux (ignoré si le navigateur ou l'hébergement ne le permet pas).
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { try { navigator.serviceWorker.register('./sw.js').catch(() => undefined); } catch { /* ignoré */ } });
}
