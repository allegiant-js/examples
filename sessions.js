const fs = require('fs');
const path = require('path');

const LogFile = require('@allegiant/logfile').LogFile;
const expect = require('@allegiant/common').expect;

const App = require('@allegiant/core');

const certPath = path.resolve(path.join(process.cwd(), 'certs'));

// take in parameters from the command line and apply to settings
const SETTINGS = require('@allegiant/cmdhelper').process(function(params) {
    return {
        logPath: path.resolve(params.get('log') || 'server-log.txt'),
        host: params.get('host') || 'http://localhost:7000',
        key: params.get('key') || path.join(certPath, 'privatekey.pem'),
        cert: params.get('cert') || path.join(certPath, 'certificate.pem')
    };
});

var logger = new LogFile(SETTINGS.logPath);

require('@allegiant/shutdown')(shutdown);
function shutdown(req=false, finished) {
    console.log("Shutting down...: ", req); // eslint-disable-line

    if (expect(logger, false)) {
        console.log("Closing log..."); // eslint-disable-line
        logger.on('finish', function() {
            console.log("Logging completed"); // eslint-disable-line
            finished();
        });
        logger.end();
    }
}

var server = App.create(SETTINGS.host, { // app config
    secure: true,
    certs: {
        key: fs.readFileSync(SETTINGS.key),
        cert: fs.readFileSync(SETTINGS.cert),
    },
    '@allegiant/sessions': {
        enabled: true,
        name: 'SESS',
        secure: false,
        path: path.resolve(path.join(process.cwd(), 'sessions')),
    }    
});

server.get('/', function() {
    this.content = "<h1>It just works!</h1>";
    return 200;
});

server.start();

