import "@testing-library/jest-dom";

// This file is run before each test file.
// It's a good place to set up global mocks.

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Add Request and Response to global scope for testing API routes
global.Request = class Request {
  constructor(url, init) {
    this.url = url;
    this.method = init?.method || "GET";
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
  }
  async json() {
    return JSON.parse(this.body);
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
  static json(obj, init) {
    return new Response(JSON.stringify(obj), init);
  }
};
