import express from "express";
import type { Application } from "express";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app: Application = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

//health endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

//@ts-ignore
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    console.error("JSON parsing error:", err);
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Internal Server Error" });
});

export default app;
