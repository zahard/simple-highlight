export function parseRegExp(obj) {
  if (!obj.text) {
    return ''
  }
  var text = obj.text;
  var reg = obj.reg;
  var matchFunc = obj.match;
  var noMatchFunc = obj.noMatch || function(t) { return t};

  var processed = [];
  var index = 0;
  var match;
  var nonRegLen;

  while (match = reg.exec(text)) {
    if (nonRegLen = match.index - index) {
      processed.push(noMatchFunc(text.substr(index, nonRegLen), match));
    }
    // Apply user function to current match
    processed.push(matchFunc(match));
    index = match.index + match[0].length;
  }

  // Trailing characters
  if (index < text.length - 1) {
    processed.push(noMatchFunc(text.substr(index), {}));
  }

  return processed.join('');
}

export function applyStyle(word, tokenType) {
	return ['<span class="sh-', tokenType, '">', word, '</span>'].join('');	
}
