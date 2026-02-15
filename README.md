# NodeServices

Simple Node.js + Express hello-world REST API.

## Quick start

Install dependencies:

```bash
npm install
```

Run the server:

```bash
npm start
```

Development (auto-reload):

```bash
npm run dev
```

## Endpoints

- `GET /` — returns JSON `{ message: 'Hello from Express!' }`
- `GET /hello` — returns plain text `Hello, world!`

## Test with curl

```bash
curl http://localhost:3000/
curl http://localhost:3000/hello
```

Port can be set with the `PORT` environment variable.
