// Vite entry point.
import './style.css';
import { initHome } from './pages/home.js';
import { startRouter } from './router.js';

initHome();
startRouter();
