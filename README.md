# Wikipedia API Tools

**Note: Experimental, only for internal use.**

## Available endpoints

**/top-edits/?date=YYYYMMDD**

Example: `/top-edits/?date=20231002`

Response:

```json
[
  {
    "pageID": "70308452",
    "title": "India at the 2022 Asian Games",
    "revisions": 286,
    "url": "https://en.wikipedia.org/wiki/India_at_the_2022_Asian_Games"
  },
  {
    "pageID": "71670293",
    "title": "Bigg Boss (Tamil season 7)",
    "revisions": 193,
    "url": "https://en.wikipedia.org/wiki/Bigg_Boss_(Tamil_season_7)"
  },
  //...
]
```

## Development

```sh
npm install
npm run dev
```
