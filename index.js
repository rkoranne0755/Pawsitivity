// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv/config";
import connectDB from "./db/connection.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is  listening at port: ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!!", err);
  });

// -r dotenv/config --experimental-json-modules
