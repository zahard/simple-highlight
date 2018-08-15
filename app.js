
function appendStyles() {
  var cssArr = [];
  cssArr.push('code.simple-highlight { font-size: 16px; padding: 15px; display: block;}');
  cssArr.push('.simple-highlight > pre { margin: 0}');
  cssArr.push('.simple-highlight.sh-theme-dark { background: #282923}');
  cssArr.push('.simple-highlight.sh-theme-dark > pre {color: #f7f7f7}');

  var css = cssArr.join('\n');
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
}

appendStyles()

var keywords = {
  'class': 'color:#67d8ef;font-style: italic',
  'function': 'color:#67d8ef;font-style: italic',
  'this': 'color:orange',
  'constructor': 'color:#67d8ef;font-style: italic',
  'document': 'color:#67d8ef;font-style: italic',
  'window': 'color:#67d8ef;font-style: italic',
  'return' :'color:#f92472',
  'if': 'color:#f92472',
  'else': 'color:#f92472',
  'const': 'color: #67d8ef',
  'new': 'color:#f92472',
  'var': 'color: #67d8ef',
}


var modifiers = {
  'class': 'color:#a6e22c',
  'function': 'color:#a6e22c',
  'new': 'color:#67d8ef;font-style: italic'
}

var styles = {
  //args: 'color: #fd9621'
}

var openBlockLevel = 0;
var wordString; 
var classLevel;
var isClass = false;
var isArguments = false;
var isFunctionDefinition = false;

var code = document.querySelector('code pre');
var text = code.innerText;
var lines = text.split('\n');
var finalLines = [];
for (var i = 0; i < lines.length; i++) {
  finalLines.push(processLine(lines[i]));
}
code.innerHTML = finalLines.join('\n');


function isClassMethod() {
  return isClass && classLevel === openBlockLevel;
}

function getWord(word, customStyle) {
  var style = keywords[word] || customStyle; 
  if (!style) {
    if (isArguments) {
      style = 'color: #fd9621';
    } else  if (isClassMethod()) {
      // Methods
      style = 'color: #a6e22c';
    } else if (/^[0-9]+$/.test(word)) {
      // Numbers
      style = 'color: #ac80ff'
    } else if(/^[\'\"].*[\'\"]+$/.test(word)) {
      // Strings
      style = 'color: #e7db74'
    }
  }

  if (style) {
    return applyStyle(word, style);
  } else {
    return word;
  }
}

function applyStyle(word, style) {
  return ['<span style="',style,'">',word,'</span>'].join('');
}

function nextWordRule(keyword) {
  if (modifiers.hasOwnProperty(keyword)) {
    return modifiers[keyword];
  } else {
    return null;
  }
}

function isWordChar(char) {
  return /[a-zA-Z0-9\_\-\'\"]/.test(char)
};

function getCharStyle(char) {
  if (/^[\+\-\*\|\/\>\<\=]+$/.test(char)) {
    return applyStyle(char, 'color:#f92472');
  } else {
    return char;
  }
}

function processLine(line) {
  var char;
  var code;
  var processed = [];
  var wordStart = false;
  var word = [];
  var nextWordModifier;
  for (var i=0; i < line.length; i++) {
    char = line[i];
    code = char.charCodeAt(0);
    if (isWordChar(char)) {
      if (!wordStart) {
        wordStart = true;
      }
      word.push(char);
    } else {
      if (wordStart) {
        // End of word
        wordString = word.join('');
        processed.push(getWord(wordString, nextWordModifier));
        nextWordModifier = nextWordRule(wordString);
        wordStart = false;
        word = [];

        // Process next words in current block leve as method names
        if (wordString === 'class') {
          classLevel = openBlockLevel + 1;
          isClass = true;
        }

        if (wordString === 'function') {
          isFunctionDefinition = true;
        }
      }

      if (isClassMethod() || isFunctionDefinition) {
        if (char === '(') {
          isArguments = true;
        } else if (char === ')') {
          isArguments = false;
          isFunctionDefinition = false;
        }
      }

      if (char == '{') {
        openBlockLevel++;
      } else if(char == '}') {
        if (isClass && classLevel == openBlockLevel) {
          isClass = false;
        }
        openBlockLevel--;
      }

      // Check for arrow function
      if (char === '=') {
        if (line[i+1] && line[i+1] === '>') {
          var nextChar;
          var k = 1;
          while(!nextChar) {
            if (! (/\s/.test(line[i+1+k]))) {
              nextChar = line[i+1+k]
            } else {
              k++;
            }
          }

          // Is arrow function
          if (nextChar === '{') {
            processed.push('=>');
            //skip next char
            i++;
            continue;
          }
        }
      }

      processed.push(getCharStyle(char));
    }
  }

  return processed.join('');
}
