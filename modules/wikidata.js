const queryWikidata = async (query) => {
  if (query){
    let data = null;
    // console.log('fetching...', query);
    try{
      const requestURL = `https://query.wikidata.org/sparql?query=${query}`;
      const headers = { Accept: "application/sparql-results+json" };
      const resp = await fetch(requestURL, { headers });
      data = await resp.json();
    } catch(err){
      console.log("queryWikidata error:", err);
    }
    return data;
  } else {
    return [];
  }


}

export default queryWikidata;
