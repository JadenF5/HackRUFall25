// app.js
import express from "express";
import exphbs from "express-handlebars";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDb } from "./config/mongoConnections.js";
import indexRoutes from "./routes/index.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use("/", indexRoutes);
app.use("/api", apiRoutes);

const port = process.env.PORT || 3000;

connectToDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.error("Failed to connect to DB", e);
  });
