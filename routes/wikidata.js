import fs from "fs";
import express from "express";
import md5 from "md5";
import NodeCache from "node-cache";
import rejectRequest from "../modules/reject-request.js";
import queryWikidata from "../modules/wikidata.js";

const appCache = new NodeCache({ stdTTL: 1800, checkperiod: 60 });

const router = express.Router();

router.get("/", async (req, res) => {
  console.log(req?.query?.query);

  if (
    !req?.query?.token ||
    req?.query?.token !== process.env.WIKIDATA_API_TOKEN
  ) {
    rejectRequest(req, res, 403);
  } else {
    if (req?.query?.query) {
      let queryResults;
      const query = req.query.query;
      const queryHash = md5(query);

      const cacheKey = `wikidata:${queryHash}`;
      const cachedQueryResults = appCache.get(cacheKey);

      if (cachedQueryResults == undefined) {
        queryResults = await queryWikidata(query);
        if (queryResults?.results?.bindings){
          queryResults = queryResults.results.bindings;
          const success = appCache.set(cacheKey, queryResults);
        }
      } else {
        queryResults = cachedQueryResults;
      }

      res.json(queryResults);
    } else {
      rejectRequest(req, res, 422);
    }
  }
});

export default router;
