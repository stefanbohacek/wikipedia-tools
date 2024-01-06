import express from "express";
import fs from "fs";
import rejectRequest from "../modules/reject-request.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (req?.query?.date) {
    let response;
    const date = req.query.date;
    const filePath = `./public/data/en/${date}.json`;

    console.log({ date, filePath });

    if (fs.existsSync(filePath)) {
      response = JSON.parse(fs.readFileSync(`${filePath}`, "utf8"));
    } else {
      response = { err: "no_data" };
    }

    res.json(response);
  } else {
    rejectRequest(req, res, 422);
  }
});

export default router;
