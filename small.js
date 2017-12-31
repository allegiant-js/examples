const App = require('@allegiant/core');

var server = App.create('http://localhost:7000');
server.get('/', function() {
    this.content = "<h1>It just works!</h1>";
    return 200;
})
.start();
