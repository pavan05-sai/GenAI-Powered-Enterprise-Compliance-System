import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
=====================================================
🛡️  COMPLIANCEGRAPH AI - SERVER READY
=====================================================
📡 Listening on: http://localhost:${PORT}
🚀 Mode: ${process.env.NODE_ENV || 'development'}
=====================================================
  `);
});
