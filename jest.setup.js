import "@testing-library/jest-dom";

// Add Request and Response to global
// Patch for Next.js API route compatibility

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
