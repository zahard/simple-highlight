

function generateKeywords() {
  var tokens = {
    self: 'this',
    blockname: 'class|function|constructor',
    globalname: 'document|window|console',
    def: 'var|const|let',
  };
  tokens.keyword = 'return|if|else|for|while|break|continue|';
  tokens.keyword += 'case|do|while|switch|extends|implements|new';
  var keywords = {};
  var words;
  for (var token in tokens) {
    words = tokens[token].split('|');
    for (var i = 0; i < words.length; i++) {
      keywords[words[i]] = token;
    }
  }
  return keywords;
}


var JsParser = {
  keywords: generateKeywords(),
  nextWordModifiers: {
    'class': 'method',
    'extends': 'method',
    'implements': 'method',
    'function': 'method',
    'new': 'globalname',
    'console': 'globalname',
  },
  regEmpty: /^\s+$/,
  regNumeric: /^\-?[0-9]+$/,
  regBool: /^true|false$/,
  regNameChar: /[a-zA-Z0-9\_]/,
  regOperator: /^[\!\&\+\-\*\|\/\>\<\=]+$/,

  openBlockLevel: 0,
  classLevel: null,
  isClass: false,
  isArguments: false,
  isFunctionDefinition: false,
  isComment: false,
};

// All token names
var TOKENS = {
  comment:'comment',
  self: 'self',
  def: 'def',
  args: 'args',
  method: 'method',
  number: 'number',
  string: 'string',
  operator: 'operator',
  keyword: 'keyword',
  blockname: 'blockname',
  globalname: 'globalname',
  functionCall: 'func',
  boolean: 'boolean'
}

JsParser.parse = function(text) {
  // Reset counters
  this.reset();
  var lines = text.split('\n');
  var readyLines = [];
  for (var line = 0; line < lines.length; line++) {
    readyLines.push(this.processLine(lines[line]));
  }
  return readyLines.join('\n');
}


JsParser.processLine = function(line) {
  var char;
  var processed = [];
  var wordStart = false;
  var word = [];
  var wordString;
  var nextWordModifier;
  var startFrom = 0;

  //Check if line commented
  if (this.isComment) {
    var commentEnd = line.indexOf('*/');
    if (commentEnd === -1) {
      return this.applyStyle(line, TOKENS.comment);
    } else {
      this.isComment = false;
      startFrom = commentEnd + 2;
      processed.push(this.applyStyle(line.substr(0, startFrom), TOKENS.comment));
    }
  }

  if (this.isMultilineString) {
    var stringEnd = line.substr(i).indexOf('`');
    if (stringEnd === -1) {
      return this.applyStyle(line, TOKENS.string);
    } else {
      this.isMultilineString = false;
      startFrom = stringEnd + 2;
      processed.push(this.applyStyle(line.substr(0, startFrom), TOKENS.string));
    }
  } 

  for (var i = startFrom; i < line.length; i++) {
    char = line[i];
    if (this.isWordChar(char)) {
      if (!wordStart) {
        wordStart = true;
      }
      word.push(char);
    } else {
      if (wordStart) {
        // End of word
        wordString = word.join('');
        // Function call
        if (char === '(' && ! this.isFunctionDefinition && !this.isClassMethod()) {
          nextWordModifier = TOKENS.functionCall;
        }

        // Object method assignment
        if (processed[processed.length-1] === '.') {
          // Find next not space char
          var nextChar = this.findNextCharIndex(line, i+1);
          // If its object propety assignemt
          if (line[nextChar] === '=') {
            var nextWordStart = this.findNextCharIndex(line, nextChar + 1);
            if (line.substr(nextWordStart, 8) === 'function') {
              nextWordModifier = TOKENS.method;
            }
          }

        }
        processed.push(this.getWord(wordString, nextWordModifier));
        nextWordModifier = this.nextWordRule(wordString);
        wordStart = false;
        word = [];

        // Process next words in current block leve as method names
        if (wordString === 'class') {
          this.classLevel = this.openBlockLevel + 1;
          this.isClass = true;
        }

        if (wordString === 'function') {
          this.isFunctionDefinition = true;
        }
      }

      switch (char) {
        // Strings
        case '"':
        case "'":
        case "`":
          // Find next same char and close this range as string
          var closeString = line.substr(i+1).indexOf(char);
          if (closeString !== -1) {
              processed.push(this.applyStyle(line.substr(i, closeString+2), TOKENS.string));
              i += closeString+1;
              continue;
          } else {
            if (char === '`') {
              this.isMultilineString = true;
            }
            processed.push(this.applyStyle(line.substr(i), TOKENS.string));
            // Exit line processing
            i = line.length;
            continue;
          }
          break;

        case '/':
          var next = line[i+1];
          if (next) {
            if (next === '/') {
              // get all the rest of line and apply comment style
              processed.push(this.applyStyle(line.substr(i), TOKENS.comment));
              // Exit line processing
              i = line.length;
              continue;
            } else if (next === '*') { // Multiline comment
              // If comment not ended on same line
              if (line.substr(i).indexOf('*/') === -1) {
                this.isComment = true;
                processed.push(this.applyStyle(line.substr(i), TOKENS.comment));
                // Exit line processing
                i = line.length;
                continue;
              }

            }
          }
          break;

        case '(':
          if (this.isClassMethod() || this.isFunctionDefinition) {
            this.isArguments = true;
            // Recet function and class names
            nextWordModifier = null;
          }
          break;
        case ')':
          if (this.isClassMethod() || this.isFunctionDefinition) {
            this.isArguments = false;
          }
          break;
        case '{':
          this.openBlockLevel++;
          this.isFunctionDefinition = false;
          break;
        case '}':
          if (this.isClassMethod()) {
            this.isClass = false;
          }
          this.openBlockLevel--;
          break;
        case '=':
          var next = line[i+1];
          if (next && next === '>') {
            var nextChar = this.findNextCharIndex(line, i+2);
            // Is arrow function
            if (line[nextChar] === '{') {
              processed.push(this.applyStyle('=>', TOKENS.blockname));
              //skip next char
              i++;
              continue;
            }
          }
          break;
      }

      processed.push(this.getCharStyle(char));
    }
  }

  return processed.join('');
}

JsParser.findNextCharIndex = function(line, start) {
  for (var i = start; i < line.length; i++) {
    if (!(this.regEmpty.test(line[i]))) {
      return i;
    }
  }
}

JsParser.isClassMethod = function() {
  return this.isClass && this.classLevel === this.openBlockLevel;
}

JsParser.getWord = function(word, customStyle) {
  var token = this.keywords[word] || customStyle; 

  if (!token) {
    if (this.isArguments) {
      token = TOKENS.args;
    } else if (this.isClassMethod()) {
      // Methods
      token = TOKENS.method;
    } else if (this.regNumeric.test(word)) {
      // Numbers
      token = TOKENS.number;
    } else if (this.regBool.test(word)) {
      token = TOKENS.boolean;
    }
  }

  if (!token) {
    var firstCharCode = word.charCodeAt(0);
    // Upper case letter consider as global object
    if (firstCharCode > 64 && firstCharCode < 91) {
      token = TOKENS.globalname;
    }
  }

  if (token) {
    return this.applyStyle(word, token);
  } else {
    return word;
  }
}

JsParser.applyStyle = function(word, token) {
  return ['<span class="sh-',token,'">',word,'</span>'].join('');
}

JsParser.nextWordRule = function(keyword) {
  if (this.nextWordModifiers.hasOwnProperty(keyword)) {
    return this.nextWordModifiers[keyword];
  } else {
    return null;
  }
}

JsParser.isWordChar = function(char) {
  return this.regNameChar.test(char)
};

JsParser.getCharStyle = function(char) {
  if (this.regOperator.test(char)) {
    return this.applyStyle(char, TOKENS.operator);
  } else {
    return char;
  }
}

JsParser.reset = function() {
  this.openBlockLevel = 0;
  this.classLevel = null;
  this.isClass = false;
  this.isArguments = false;
  this.isFunctionDefinition = false;
  this.isComment = false;
}

export default JsParser;
