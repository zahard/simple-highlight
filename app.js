
var code = document.querySelector('#source');
var text = code.innerText;

var lines = text.split('\n');
var finalLines = [];

var keywords = {
  'class': 'color:blue;font-style: italic',
  'function': 'color:blue;font-style: italic',
  'this': 'color:orange',
  'constructor': 'color:blue;font-style: italic',
  'return' :'color:red',
  'if': 'color:red',
  'else': 'color:red',
  'const': 'color: blue',
  'new': 'color:red',
  'var': 'color:blue',
}


var modifiers = {
  'class': 'color:green',
  'function': 'color:green',
  'new': 'color:blue'
}

for (var i = 0; i < lines.length; i++) {
  finalLines.push(processLine(lines[i]));
}

function getWord(word, customStyle) {
  var style = keywords[word] || customStyle;
  // Numbers
  if (/^[0-9]+$/.test(word)) {
    style = 'color: red'
  // Strings
  } else if(/^[\'\"].*[\'\"]+$/.test(word)) {
    style = 'color: green'
  }

  if (style) {
    return `<span style="${style}">${word}</span>`;
  } else {
    return word;
  }
}
function nextWordRule(keyword) {
  return modifiers[keyword]
}

function isWordChar(char) {
  return /[a-zA-Z0-9\_\-\'\"]/.test(char)
};

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
        processed.push(getWord(word.join(''), nextWordModifier));
        nextWordModifier = nextWordRule(word.join(''));
        wordStart = false;
        word = [];
      }
      processed.push(char);
    }
  }

  return processed.join('');
}


var html = finalLines.join('\n');
document.querySelector('#dest').innerHTML = html;
