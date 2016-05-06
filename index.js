var express = require('express');
var wagner = require('wagner-core');

require('./models/model')(wagner);
require('./dependencies/dependencies')(wagner);

var app = express();

wagner.invoke(require('./auth') , {app: app});

app.use('/api/v1' , require('./srv/api')(wagner));

app.listen(3000);

console.log('Listening on port 3000!');