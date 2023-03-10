const http = require('http');

const server = http.createServer((req, res) => {
    res.end('Requête reçue.');
});

server.listen(process.env.PORT || 3000);