import { DATA_PROVIDER } from '../config';
import { DataAdapter, googleSheetsAdapter, mockAdapter } from './data-adapter';

// TODO: Add supabaseAdapter and switch by NEXT_PUBLIC_DATA_PROVIDER.
export function getDataAdapter(): DataAdapter {
  if (DATA_PROVIDER === 'google-sheets') {
    return googleSheetsAdapter;
  }

  if (DATA_PROVIDER === 'supabase') {
    return mockAdapter;
  }

  return mockAdapter;
}
