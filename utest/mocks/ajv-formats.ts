// AJV-formats Mock for testing
import { vi } from 'vitest';

// Mock addFormats function
const mockAddFormats = vi.fn().mockImplementation((ajv: any) => {
  // Mock implementation that doesn't actually add formats but doesn't throw errors
  return ajv;
});

export default mockAddFormats;