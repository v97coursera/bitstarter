var express = require('express');

var app = express.createServer(express.logger());

fs.readFileSync('/index.html', 'utf-8', function(err, data){
    if(err)throw err;
       
    //var buf = new Buffer(data, 0,data.length);

    app.get('/', function(request, response) {
      response.send(data);
    });
}



var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});