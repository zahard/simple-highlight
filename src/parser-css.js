
var CssParser = {};

CssParser.parse = function(text) {

  var reg = /([^\s][^\{]*?[^\s]?)(\s?)(\{)([^\}]*?)(\})/g;

  
  return this.parseWithRegExp(reg, text, function(css) {
    return [
      this.parseSelector(css[1]),
      css[2],
      css[3],
      this.parseRules(css[4]),
      css[5],
    ].join('');
  }.bind(this));
}


CssParser.parseSelector = function(text) {
  var reg = /(\#?\.?)([a-zA-Z0-9\-]+)/g;
  return this.parseWithRegExp(reg, text, function(path) {
    var token = 'keyword';
    if (path[1] === '.') {
      token = 'method';
    } else if(path[1] === '#') {
      token = 'args';
    }
    return this.applyStyle(path[0], token);
  }.bind(this));
}

CssParser.parseRules = function(text) {
  var rules = [];
  text.split(';').forEach(function(rule) {
    var parts = rule.split(':');
    if (parts.length < 2) {
      rules.push(rule);
      return;
    }

    rules.push([
      this.applyStyle(parts[0], 'blockname'),
      this.parseCssValue(parts[1])
    ].join(':'));

  }.bind(this));

  return rules.join(';');
}

CssParser.parseCssValue = function(value) {
  return this.applyStyle(value, 'number');
}

CssParser.parseWithRegExp = function(reg, text, func, noTagFunc) {
  noTagFunc = noTagFunc || function(t) { return t};
  var processed = [];
  var index = 0;
  var match;
  var nonRegLen;

  while (match = reg.exec(text)) {
    if (nonRegLen = match.index - index) {
      processed.push(noTagFunc(text.substr(index, nonRegLen), match));
    }
    // Apply user function to current match
    processed.push(func(match));
    index = match.index + match[0].length;
  }

  // Trailing characters
  if (index < text.length - 1) {
    processed.push(text.substr(index));
  }

  return processed.join('');
}



CssParser.applyStyle = function(word, token) {
  return ['<span class="sh-',token,'">',word,'</span>'].join('');
}

export default CssParser;
