import fs from "fs";
import util from "util";
import sleep from "./sleep.js";
import sortArrayByKey from "./sort-array-by-key.js";

const getDate = () => {
  let dateYesterday = new Date();
  dateYesterday.setDate(dateYesterday.getDate() - 1);
  const date = dateYesterday.toISOString().split("T")[0].replaceAll("-", "");
  return date;
};

const processData = async (date) => {
  const dir = `./data/en/${date}`;
  let result = {};
  let pageTitles = {};
  const files = fs.readdirSync(dir, { withFileTypes: false });

  files.forEach((file) => {
    const filePath = `${dir}/${file}`;
    console.log(
      `processing file ${parseInt(file.replace(".json", "")) + 1}/${
        files.length
      }...`
    );

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    // console.log(util.inspect(data.query.allrevisions, false, null, true));

    data.query.allrevisions.forEach((item, index) => {
      console.log(
        `processing revision ${index + 1}/${data.query.allrevisions.length}...`
      );

      if (result[item.pageid]) {
        result[item.pageid] += item.revisions.length;
      } else {
        result[item.pageid] = item.revisions.length;
        pageTitles[item.pageid] = item.title;
      }
    });
  });

  let resultArray = Object.keys(result).map((key) => {
    return {
      pageID: key,
      title: pageTitles[key],
      revisions: result[key],
    };
  });

  resultArray = sortArrayByKey(resultArray, "revisions");
  const cutoff = resultArray[4].revisions;

  resultArray = resultArray.filter((item) => item.revisions >= cutoff);

  let pageData = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&prop=info&pageids=${resultArray
      .map((page) => page.pageID)
      .join("|")}&inprop=url&format=json`
  );

  let data = await pageData.json();

  resultArray.forEach((page) => {
    page.url = data.query.pages[page.pageID].fullurl;
  });

  const dirResult = `./public/data/en`;

  if (!fs.existsSync(dirResult)) {
    fs.mkdirSync(dirResult);
  }

  fs.writeFileSync(
    `${dirResult}/${date}.json`,
    JSON.stringify(resultArray),
    "utf8"
  );
};

const fetchData = async (fetchDate) => {
  const date = fetchDate || getDate();

  if (!fs.existsSync(`./public/data/en/${date}.json`)) {
    console.log(`fetching data for ${date}...`);

    const dir = `./data/en/${date}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      await fetchAllData();
    } else {
      const files = fs.readdirSync(dir, { withFileTypes: false });
      const indices = files.map((file) => parseInt(file.replace(".json")));
      const lastIndex = Math.max(...indices);
      const lastFile = `${lastIndex}.json`;
      const data = JSON.parse(fs.readFileSync(`${dir}/${lastFile}`, "utf8"));

      if (data?.continue?.arvcontinue) {
        const index = lastIndex + 1;
        await fetchAllData(index, data.continue.arvcontinue);
      } else {
        await processData(date);
      }
    }
  } else {
    console.log(`data for ${date} exists`);
  }
  return true;
};

const fetchAllData = async (page, next) => {
  page = page || 0;

  const date = getDate();
  const dateStart = `${date}000000`;
  const dateEnd = `${date}235959`;

  let url = `https://en.wikipedia.org/w/api.php?action=query&list=allrevisions&arvnamespace=0&arvstart=${dateStart}&arvend=${dateEnd}&arvprop=ids%7Ctimestamp&arvdir=newer&arvlimit=max&format=json`;

  if (next) {
    url = `${url}&arvcontinue=${next}`;
  }

  console.log("fetching...", url);

  let response = await fetch(url);
  let data = await response.json();
  console.log("saving...");

  fs.writeFileSync(
    `./data/en/${date}/${page}.json`,
    JSON.stringify(data),
    "utf8"
  );

  if (data?.continue?.arvcontinue) {
    await sleep(300);
    page++;
    fetchAllData(page, data.continue.arvcontinue);
  } else {
    processData(date);

    setInterval(() => {
      fetchAllData();
    }, 3600000);
  }
};

export default fetchData;
