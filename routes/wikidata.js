import fs from "fs";
import express from "express";
import md5 from "md5";
import NodeCache from "node-cache";
import rejectRequest from "../modules/reject-request.js";
import queryWikidata from "../modules/wikidata.js";

const appCache = new NodeCache({
  stdTTL: 1800,
  checkperiod: 60,
  deleteOnExpire: false
});

const updateWikiData = async (query) => {
  console.log("updating cache...", query);
  const queryHash = md5(query);  
  const cacheKey = `wikidata:${queryHash}`;
  let queryResults = await queryWikidata(query);

  if (queryResults?.results?.bindings){
    queryResults = queryResults.results.bindings;
    const success = appCache.set(cacheKey, {
      query,
      results: queryResults
    });
  }
  return queryResults;
}

appCache.on( "expired", ( key, value ) => {
  updateWikiData(value.query);
});


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
        queryResults = await updateWikiData(query);
      } else {
        console.log("loading from cache...");
        queryResults = cachedQueryResults.results;
      }

      res.json(queryResults);
    } else {
      rejectRequest(req, res, 422);
    }
  }
});

export default router;
