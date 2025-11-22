import { createServer } from 'vite';

(async () => {
  const server = await createServer({
    server: {
      port: 5000,
      host: '0.0.0.0',
    },
  });

  await server.listen();
  console.log(`Vite dev server running on port 5000`);
})();
