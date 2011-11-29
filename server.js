var static = require('node-static');

var port = 3000;

var file = new(static.Server)('./public');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    });
}).listen(port);

console.log("Serving on port " + port);
