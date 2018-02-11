console.log('www server 0.0.1')

//app.process.port = ((app.TypeBoletines.indexOf(app.Type) + 2) + app.anyo) * 1
var App = {
    express : require('express'),
    http : require('http'),
    fs: require("fs"),
    path: require('path'),
    mysql: require('mysql'),
    inquirer: require('inquirer'),
}


var relanciones_controller = function (req, res) {
            //debugger
            var _key = req.path.split("/")[req.path.split("/").length - 1]
            options.SQL.db.query("SELECT * FROM borme_tree where _key = ? ", [_key], function (err, record) {
                if(record.length>0)
                    res.send(record[0]._tree)
            })
        }

var tree_controller = function (req, res) {
            var file = __dirname + '/node_www/www/tree.html'
            App.fs.readFile(file, function (err, data) {

                data = data.toString().replace('@key', req.path.split("/")[req.path.split("/").length - 1])
                res.send(data)

            })
        }

var initalize_webserver = function (options) {
        var express_server = App.express();
        var server_port = 8080
        var server = App.http.createServer(express_server).listen(server_port);

        express_server.get('/css/*', function (req, res) {
            res.sendFile(__dirname + '/www/public/' + req.url);
        })
        express_server.get('/js/*', function (req, res) {
            res.sendFile(__dirname + '/www/public/' + req.url);
        })
        express_server.get('/tree/*', tree_controller );
        express_server.get('/relaciones/*', relanciones_controller );
    }


var initalize_sql_and_then_webserver = function (SQL) {
    var persistenceService = {SQL: { db: null }, Command: 'PARSER' };
    var action = 'PARSER' ;
    var a_file_for_something = 'ACCESO_mysql_PARSER'
    SQL.init(persistenceService, action, a_file_for_something, initalize_webserver)
}

require('./node_app/sql_common.js')(App, initalize_sql_and_then_webserver);
