String.prototype.Trim = function Trim(x) {
    if (typeof x === 'object') {
        for (i in x) {
            x[i] = x[i].replace(/^\s+|\s+$/gm, '');
        }
        return x
    } else {
        return x.replace(/^\s+|\s+$/gm, '');
    }
}

String.prototype.pad = function (size) {
    var s = "000000000" + this;
    return s.substr(s.length - size);
}

String.prototype.Between = function (init, last, contains, not) {
    var string = this.toString()
    var _exit = ""
    var _i = 0
    while (string.indexOf(last, _i) > 0) {
        var _str = ""
        var pf = pi = string.indexOf(last, _i)
        //var found = false
        while (pi > 0 && string.substr(pi, 1) != init) {
            var char = string.substr(pi, 1)
            if (char != not)
                _str = char + _str
            pi--
        }
        if (_str.indexOf(contains) > -1)
            _exit = ''.Trim(_str.substr(0, _str.indexOf(contains))) + (_exit.length > 0 ? ';' : '') + _exit
        string = string.substr(pf + 1, string.length)
    }
    return _exit.length > 0 ? _exit : null
};
String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};
String.prototype.indexOfRegex = function (regex) {
    var match = this.match(regex);
    return match ? this.indexOf(match[0]) : -1;
};
String.prototype.lastIndexOfRegex                   = function (regex) {
    var match = this.match(regex);
    return match ? this.lastIndexOf(match[match.length - 1]) : -1;
};



module.exports = String ;
