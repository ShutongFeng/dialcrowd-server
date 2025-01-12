const express = require('express');
const morgan = require('morgan')
const app = module.exports.app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const server = require('http').createServer(app);
const restApi = require(path.join(__dirname, 'routes/rest_api'));
const PORT = 3040;

app.use(morgan(':remote-addr [:date] :method :url :status :res[content-length] - :response-time ms'))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extend: false }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// APIs
app.use('/api', restApi);

// Everything else
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// cors setting TODO set to https://dialeval.cs.hhu.de?

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.frontEndURL)
});

server.listen(process.env.PORT || PORT, function () {
  console.log("DialCrowd backend running on port " + (process.env.PORT || PORT) + "(" + process.env.NODE_ENV + ")")
});
