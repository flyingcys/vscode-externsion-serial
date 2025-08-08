// AJV Mock for testing
import { vi } from 'vitest';

// Mock AJV class
class MockAjv {
  private schemas: Map<string, any> = new Map();
  private validationResult: boolean = true;
  private validationErrors: any[] | null = null;

  constructor(options?: any) {
    // Mock constructor
  }

  addSchema(schema: any, key?: string): MockAjv {
    if (key) {
      this.schemas.set(key, schema);
    }
    return this;
  }

  compile(schema: any): (data: any) => boolean {
    return vi.fn().mockImplementation((data: any) => {
      this.errors = this.validationResult ? null : this.validationErrors;
      return this.validationResult;
    });
  }

  validate(schemaOrRef: any, data: any): boolean {
    this.errors = this.validationResult ? null : this.validationErrors;
    return this.validationResult;
  }

  get errors(): any[] | null {
    return this.validationErrors;
  }

  set errors(value: any[] | null) {
    this.validationErrors = value;
  }

  // Test helpers
  setValidationResult(result: boolean, errors?: any[]): void {
    this.validationResult = result;
    this.validationErrors = errors || null;
  }
}

// Mock AJV default export
const MockAjvConstructor = vi.fn().mockImplementation((options?: any) => {
  return new MockAjv(options);
});

// Add static methods if needed
MockAjvConstructor.prototype = MockAjv.prototype;

export default MockAjvConstructor;
export { MockAjvConstructor as Ajv };