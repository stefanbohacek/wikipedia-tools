import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import indexRoute from './routes/index.js';
import topEdits from './routes/top-edits.js';
import fetchData from './modules/fetch-data.js';

const app = express();

app.use(compression());
app.use(express.static('public'));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use('/', indexRoute);
app.use('/top-edits', topEdits);

fetchData();

export default app;
