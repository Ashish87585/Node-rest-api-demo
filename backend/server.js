const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

//Unhandled rejection errror
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(
    `Shutting down the server due to uncaughtException promise rejection`
  );
  server.close(() => {
    process.exit(1);
  });
});

//config
dotenv.config({ path: "backend/config/config.env" });

connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

//Unhandled rejection errror
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandle promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
