/**
 * Jest setup file for tests.
 * This file runs before all tests to set up mocks.
 */

// Mock node-fetch before any imports
const mockFetch = jest.fn();
jest.mock('node-fetch', () => mockFetch);

// Mock form-data
jest.mock('form-data', () => {
  const FormData = jest.fn().mockImplementation(() => {
    const formData: any = {
      append: jest.fn(),
      getHeaders: jest.fn(() => ({})),
    };
    return formData;
  });
  return FormData;
});

// Mock fs for file operations
jest.mock('fs', () => {
  const fs = jest.requireActual('fs');
  return {
    ...fs,
    createReadStream: jest.fn(() => ({
      pipe: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      emit: jest.fn(),
    })),
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => 'mock file content'),
    writeFileSync: jest.fn(),
  };
});

// Make mockFetch available globally for tests
(global as any).mockFetch = mockFetch;
