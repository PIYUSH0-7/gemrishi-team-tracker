const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`💎 GemRishi Team Work Tracker Backend Server Started`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
