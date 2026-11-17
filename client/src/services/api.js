// Single entry point for data access. Set VITE_USE_MOCK=false to use the Express backend.
import { mockApi } from './mockApi';
import { httpApi } from './httpApi';
export const api = import.meta.env.VITE_USE_MOCK === 'false' ? httpApi : mockApi;
export { STATUSES } from './mockApi';
