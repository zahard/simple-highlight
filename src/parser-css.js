import { parseRegExp, applyStyle } from './base';

var CssParser = {
  regCss: /([^\s][^\{]*?[^\s]?)(\s?)(\{)([^\}]*?)(\})/g,
  regSelector: /(\#?\.?)([a-zA-Z0-9\-]+)/g,
  regValueString: /(([\'\"])[^\2]*?\2)/g,
  regValueColor: /(\#)([0-9a-eA-E]{3,6})/,
  regValueNumber: /([0-9\.]+)([a-zA-Z]+)?/,

  TOKENS: {
    selectorTag: 'css-tag',
    selectorClass: 'css-classname',
    selectorId: 'css-id',
    ruleName: 'css-name',
    ruleVal: 'css-val',
    ruleValString: 'css-valstr',
    ruleValUnit: 'css-valunit',
    ruleValNum: 'css-valnum',
    ruleValHash: 'css-valhash',
  }
};

CssParser.parse = function(text) {
  return parseRegExp({
    reg: this.regCss,
    text: text,
    match: function(css) {
      return [
        this.parseSelector(css[1]),
        css[2],
        css[3],
        this.parseRules(css[4]),
        css[5],
      ].join('');
    }.bind(this)
  });
}

CssParser.parseSelector = function(text) {
  return parseRegExp({
    reg: this.regSelector, 
    text: text, 
    match: function(path) {
      var token = this.TOKENS.selectorTag;
      if (path[1] === '.') {
        token = this.TOKENS.selectorClass;
      } else if(path[1] === '#') {
        token = this.TOKENS.selectorId;
      }
      return applyStyle(path[0], token);
    }.bind(this)
  });
}

CssParser.parseRules = function(text) {
  var rules = [];
  // Split by separate rules
  text.split(';').forEach(function(rule) {
    // Split into rule name and value
    var parts = rule.split(':');
    if (parts.length < 2) {
      rules.push(rule);
      return;
    }
    if (parts.length > 2) {
      // Situation when semicolon missed  before line break
      var fixedRules = rule.split('\n');
      var fixed = [];
      for (var i=0;i < fixedRules.length;i++) {
        if (!fixedRules[i]) {
          fixed.push('');
          continue;
        }
        var parts = fixedRules[i].split(':');
        fixed.push([
          applyStyle(parts[0], this.TOKENS.ruleName),
          this.parseRuleValue(parts[1])
        ].join(':'))
        
      }
      rules.push(fixed.join('\n'));
      return;
    } else {
      rules.push([
        applyStyle(parts[0], this.TOKENS.ruleName),
        this.parseRuleValue(parts[1])
      ].join(':'));
    }
  }.bind(this));

  return rules.join(';');
}

CssParser.parseRuleValue = function(value) {
  // Separate string and non string values
  return parseRegExp({
    reg: this.regValueString,
    text: value,
    match: this.parseRuleString.bind(this),
    noMatch: this.parseRuleNonString.bind(this)
  });
}

CssParser.parseRuleString = function(match) {
  return applyStyle(match[1], this.TOKENS.ruleValString);
}

CssParser.parseRuleNonString = function(rule) {
  // Split non string by white space
  var ready = [];
  var parts = rule.split(' ');
  var part;
  var match;
  for (var i = 0; i < parts.length; i++) {
    part = parts[i];
    if (!part) {
      ready.push(part);
      continue;
    }

    if (match = this.regValueColor.exec(part)) {
      ready.push([
        applyStyle(match[1], this.TOKENS.ruleValHash),
        applyStyle(match[2], this.TOKENS.ruleValNum)
      ].join(''));
      continue;
    }

    if (match = this.regValueNumber.exec(part)) {
      var num = [applyStyle(match[1], this.TOKENS.ruleValNum)];
      if (match[2]) {
        num.push(applyStyle(match[2], this.TOKENS.ruleValUnit));
      }
      ready.push(num.join(''));
      continue;
    }
    ready.push(applyStyle(part, this.TOKENS.ruleVal)); 
  }
  return ready.join(' ');
}


export default CssParser;
