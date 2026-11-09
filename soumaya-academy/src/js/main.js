import content from '../../content/content.json';
import * as C from './content.js';
import { boot } from './game.js';

C.init(content);
const start = () => boot();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').then((r) => r.update && r.update()).catch(() => { /* hors ligne non disponible */ });
  // nouvelle version installée : on recharge une fois pour l'afficher tout de suite
  let reloaded = false; const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } });
}
window.addEventListener('error', (e) => { window.__errors = (window.__errors || []).concat(String(e.message)); });
