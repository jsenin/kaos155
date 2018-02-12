var Version = '0.1.4'
const String = require('./node_app/custom_strings');

let App = {
  version: Version,
  //datos generales
  _fileCredenciales: 'ACCESO_mysql_',
  TypeBoletines: ["BORME", "BOE", "BOCM"],
  Commands: ['SCRAP', 'PARSER', 'EXIT'],
  Mins: { BOE: 2001, BOCM: 2010, BORME: 2009 },

  //Plugins
  _: require('lodash'),
  mysql: require('mysql'),
  iconv: require('iconv-lite'),
  request: require('request'),
  mkdirp: require('mkdirp'),
  cheerio: require('cheerio'),
  path: require('path'),
  fs: require("fs"),
  http: require('http'),
  moment: require("moment"),
  merge: require('merge'),
  inquirer: require('inquirer'),
  resolvePath: require('resolve-path'),
  aguid: require('aguid'),
  schedule: require('node-schedule'),
  _returnfunc : function (app, options, data, ok) {
    if (ok > 0) {
      options._common.Actualize(options, options.Type, {}, app._returnfunc)
    } else {
      debugger
    }
  }
}


let buildStartApp = function(arguments) {
  var app_action_mode = arguments[0]
  var bulletin_name = arguments[1]
  var bulletin_date = arguments[2]
  return function (app) {
    const date = new Date();
    if (bulletin_name == 'BOCM' && app.Mins[bulletin_name] == app.anyo) {
      bulletin_date = (date.getFullYear() + '').pad(4) + '0212'
    } else {
      if (bulletin_name == 'BORME' && app.Mins[app_action_mode] == app.anyo) {
        bulletin_date = (date.getFullYear() + '').pad(4) + "0102"
      } else {
        bulletin_date = (date.getFullYear() + '').pad(4) + (date.getMonth() + 1 + '').pad(2) + (date.getDate() + '').pad(2)
      }
    }

    //debugger
    if (app.Mins[bulletin_name] <= app.anyo) {
      app.initDate = bulletin_date
      console.log('MySQL IP:' + app.SqlIP)
      console.log('PROCESS:' + app.Type)
      console.log('Anyo:' + app.anyo)
      app.init(app, function (_f) { _f[app_action_mode](app.Type) })
    } else {
      console.log('no se puede analizar ' + bulletin_name + ' con fecha anterior a ' + app.Mins[bulletin_date])
    }

  }

}

let configureSettingsAndRun = function (app, myArgs, date, automatic) {
  var App = app.merge(app, {
    command: myArgs[0],

    update: myArgs[3],
    anyo: !isNaN(myArgs[2]) ? myArgs[2] : date.getFullYear(),
    Command: myArgs[0],


    _lb: { BOCM: 5, BOE: 6, BORME: 8 },
    timeDelay: 1500,
    drop: false,
    SqlIP: null, //'192.168.0.3',
    urlBOE: 'http://81.89.32.200/',
    urlBORME: 'http://81.89.32.200/',
    urlBOCM: 'http://w3.bocm.es/boletin/CM',
    PDFStore: "../DataFiles/_almacen/PDF/",
    _xData: {
      Sumario: {
        BOE: { SUMARIO_LAST: '', SUMARIO_NEXT: 'BOE-S-20010102' },
        BORME: { SUMARIO_LAST: '', SUMARIO_NEXT: 'BORME-S-20090102' },
        BOCM: { SUMARIO_LAST: '', SUMARIO_NEXT: 'BOCM-S-20100212' }
      },
      TSUMARIOS: {
        BOE: 0,
        BORME: 0,
        BOCM: 0
      },
      TBOE: 0,
      TBORME: 0,
      TBOCM: 0
    },
    _lData: {},
    poolSql: [],
    Rutines: function (app) {
      _this = this
      return require('./node_app/func_common.js')(app)
    },
    init: init,
    logStop: log_stop,
    parameters: parameters,
    getCounter: get_counter,
    process: {
      stdout: {
        write: process_stdout_write
      }
    }
  })
  App.parameters(App, myArgs, buildStartApp(myArgs))
}

let init = function (app, callback) {
  //app._io = require('./node_www/IO.js')(app)

  //= app._io.listen(require('socket.io').listen(80), require('./node_app/elasticIO.js')(app))

  let assembleActionsAndRun = function (SQL) {
    app.commonSQL = SQL

    let availableActionFactory = {
      PARSER: parserBuilder(app),
      SCRAP: scrapBuilder(app) ,
      CREATE: createSQLBuilder(app)
    }
    callback(availableActionFactory)
  }

  this.pdftotext = require('./node_app/_utils/pdftotext.js')
  const SQLCommons = require('./node_app/sql_common.js')
  return SQLCommons(app, assembleActionsAndRun)
}

let parserBuilder = function(app) {
  return function (bulletin_name) {
    //cargamos la rutina de escrapeo específica del tipo de BOLETIN
    //cuando cargamos la rutina incorporamos en la llamada app y la funcion de retorno una vez cargado el objeto
    //el retorno es el objeto encargado del escrapeo
    const prefix = 'par_'
    const parser_name = prefix + bulletin_name.toLowerCase() + '.js'
    const parser = require('./node_app/parser/' + parser_name)
    let httpServerHandler = function (io) {
      if (app.process.stdout.io == null) {
        app.process.stdout.io = io
        //realizamos el proceso de parseo
        options._common.Actualize(options, bulletin_name, {}, app._returnfunc)
      }
    }

    let parserRutine = function (options) {
      //options = objeto que realiza el escrapeo
      //app.BOE.SQL.db = objeto para acceder directamente a la db en todas las funciones y rutinas
      if (app.BOLETIN == null) {
        app.BOLETIN = options

        app._io = require('./node_www/IO.js')(app)

        const httpServer = require('./node_www/server_http.js')
        httpServer(app, httpServerHandler)
      }
    }

    return parser(app, parserRutine)
  }
}

let scrapBuilder = function(app){

  return function (bulletin_name) {

    //require('./node_app/elasticIO.js')(app).init(function (options) {
    //app.io = { elasticIO: options }

    //cargamos la rutina de escrapeo específica del tipo de BOLETIN
    //cuando cargamos la rutina incorporamos en la llamada app y la funcion de retorno una vez cargado el objeto
    //el retorno es el objeto encargado del escrapeo
    const prefix = 'scr_'
    const scrapper_name = prefix + bulletin_name.toLowerCase() + '.js'
    const scrapper = require('./node_app/scrap/' + scrapper_name)

    let httpServerHandlerBuilder = function(options) {
      return function (io) {
        app.process.stdout.io = io
        options._common.Actualize(options,
          bulletin_name,
          { desde: app._xData.Sumario[bulletin_name].SUMARIO_NEXT.substr(app._lb[bulletin_name], 8),
            into: app._xData.Sumario[bulletin_name].ID_LAST,
            type: bulletin_name,
            Secciones: "5A",
            hasta: new Date()
          })
      }
    }

    let scrapperRutine = function (options) {
      //options = objeto que realiza el escrapeo
      //app.BOE.SQL.db = objeto para acceder directamente a la db en todas las funciones y rutinas
      app.BOLETIN = options
      //cargamos los contadores para poder continuar donde se dejó
      app.commonSQL.SQL.getCounter(app, options, bulletin_name, function (options) {
        //realizamos el proceso de escrapeo
        app._io = require('./node_www/IO.js')(app)
        const httpServer = require('./node_www/server_http.js')
        let httpServerHandler = httpServerHandlerBuilder(options)
        httpServer(app, httpServerHandler)
      })
    }
    return scrapper(app, scrapperRutine)
  }
}

let createSQLBuilder = function(app) {
  return function (datafile) {
    app.commonSQL.init({ SQL: { db: null } }, 'CREATE', function () {
      process.exit(1)
    })

  }
}

  let log_stop = function (i, text) {
    console.log(i + '.-' + text)
    console.log('SISTEMA DETENIDO')
    process.exit(i)
  }

  let parameters = function (app, myArgs, callback) {
    var arg = myArgs[3]
    //app.SqlIP = myArgs[1]
    if (app.SqlIP != null && app.SqlIP != 'localhost') {
      if (app.SqlIP.match(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/g).length != 1) {
        app.SqlIP = 'localhost'
      }
    } else {
      app.SqlIP = 'localhost'
    }

    if (app.Commands.indexOf(myArgs[0]) == -1) {
      app.logStop(1, 'comando no valido falta SCRAP PARSE BORME')

    } else {

      if (app.TypeBoletines.indexOf(myArgs[1]) == -1) {
        app.logStop(2, 'parametros no validos falta BOCM BOE BORME')
      }
    }

    app.Type = myArgs[1]
    callback(app)
  }

  let get_counter = function (app, _options, bulletin_name, callback) {
    _cadsql = "SELECT * FROM lastread WHERE Type = '" + bulletin_name + "' AND Anyo = " + app.anyo
    _options.SQL.db.query(_cadsql, function (err, Record) {
      if (err) {
        debugger
      } else {
        if (Record.length == 0) {
          _cadsql = "INSERT INTO lastread (Type, Anyo, SUMARIO_NEXT) VALUES ('" + bulletin_name + "'," + app.anyo + ",'" + bulletin_name + "-S-" + app.initDate + "')"  //2001
          _options.SQL.db.query(_cadsql, function (err, _data) {
            app._xData.Sumario[bulletin_name] = { SUMARIO_LAST: '', SUMARIO_NEXT: bulletin_name + '-S-' + app.initDate }
          })
        } else {
          app._xData.Sumario[bulletin_name] = Record[0]
        }
        var _cadsql = "SELECT count(*) FROM sumarios WHERE Type='" + bulletin_name + "'"
        _options.SQL.db.query(_cadsql, function (err, Record) {
          //if (err)
          app._xData.TSUMARIOS[bulletin_name] = Record[0]["count(*)"]

          _cadsql = "SELECT count(*) FROM boletin where Type='" + bulletin_name + "'"
          _options.SQL.db.query(_cadsql, function (err, Record) {
            app._xData['T' + bulletin_name] = Record[0]["count(*)"]
            callback(_options)
          })
        })
      }
    })
  }

  let process_stdout_write = function (app, options,_cini, string, _cfin) {

    process.stdout.write(_cini + string + _cfin)
    var cadsql = "SELECT * FROM lastread WHERE Type=? AND Anyo=?;" //sumarios (_counter, Anyo, SUMARIO, BOLETIN, Type) VALUES ('" + (app._xData.TSUMARIOS[options.type] + 1) + "','" + app.anyo + "','" + _sumario + "', '" + _boletin + "','" + options.type + "')"

    options.SQL.scrapDb.SQL.db.query(cadsql, [app.Type, app.anyo], function (err, records) {
      app.process.stdout.io.emit('graphData', { code: string, color: { _i: _cini, _f: _cfin }, record: { SUMARIO: records[0].SUMARIO_NEXT, LAST_ID: records[0].ID_LAST } })
    })
  }


  let main = function(arguments) {
    const optionsMenu = require("./node_app/options_menu.js")
    optionsMenu(App, arguments,  configureSettingsAndRun)
  }



  console.log('kaos155 App SCRAP - version -' + Version + '.')
  let arguments = process.argv.slice(2)
  main(arguments)
