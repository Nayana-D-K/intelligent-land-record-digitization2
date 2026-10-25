import { apiClient } from './client';
import { mockClient } from './mock';

const useMock = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true;

if (useMock) {
  console.info('🔌 Running with Mock API (VITE_USE_MOCK=true)');
} else {
  console.info(`🌐 Running with Real API (${import.meta.env.VITE_API_BASE_URL || 'relative'})`);
}

export const api = useMock ? mockClient : apiClient;

export default api;

