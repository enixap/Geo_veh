const { loadEnv } = require("./config/env");
const { createApp } = require("./app");

loadEnv();

const app = createApp();
const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API démarrée sur http://localhost:${port}`);
});

