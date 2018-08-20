import JsParser from './parser-js';

var HtmlParser = {
  TOKENS: {
    tag: 'tag',
    attrName: 'attrName',
    attrVal: 'attrVal',
    comment: 'comment',
  }
};

HtmlParser.parse = function(html) {
  //Check for comment start
  var startComment = html.indexOf('<!--');
  var startFrom = (startComment !== -1) ? startComment + 4 : 0
  var commentEnd = html.indexOf('-->');
  var end = (commentEnd !== -1) ? commentEnd - startFrom : undefined;
  html = html.substr(startFrom, end);

  var tagReg = /<[^\>]+>/g;
  return this.parseWithRegExp(tagReg, html, this.parseHtmlTag.bind(this), function(text, match) {
    // Process inline script tag
    if (match[0] === '</script>') {
      return '<span class="inline-js">'+JsParser.parse(text)+'</span>';
    }

    // Process inline style tag
    if (match[0] === '</style>') {
      return '<span class="sh-comment">'+text+'</span>';
      //return CssParser.parse(text);
    }
    return text;
  });
}

HtmlParser.parseHtmlTag = function(tag) {
  var match = /^(<\/?)([a-zA-Z\-0-9]+)([^\>]*?)(\/?>)$/.exec(tag[0]);
  if (!match) {
    return this.replaceHtmlChars(tag[0]);
  }
  var tagName = match[2];
  var tagAttrs = match[3];  
  var tagContent = [
    this.replaceHtmlChars(match[1]),
    this.applyStyle(tagName, this.TOKENS.tag),
    this.parseHtmlAttrs(tagAttrs),
    this.replaceHtmlChars(match[4])
  ];
  return tagContent.join('');
}

HtmlParser.parseHtmlAttrs = function(attrs) {
  var reg = /([a-zA-Z\-\_\*\$]+)(((=)(([\'\"])[^\6]*?\6))|\s)?/g;
  return this.parseWithRegExp(reg, attrs, this.highlightAttr.bind(this));
}

HtmlParser.highlightAttr = function(attr) {
  var attrStr = [];

  // Attribute name
  attrStr.push(this.applyStyle(attr[1], this.TOKENS.attrName));
  // If attribute has value
  if (attr[4]) {
    // = char
    attrStr.push(attr[4]);
    // Attribute value
    attrStr.push(this.applyStyle(attr[5], this.TOKENS.attrVal));

  } else if(attr[2]) {
    // Empty space after attribute without value
    attrStr.push(attr[2]);
  }
  return attrStr.join('');
}

HtmlParser.parseWithRegExp = function(reg, text, func, noTagFunc) {
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

HtmlParser.replaceHtmlChars = function(text) {
  var replaceChars = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;',
  }
  return text.replace(/\<|\>|\"|\&/g, function(match) { 
    return replaceChars[match];
  });
}

HtmlParser.applyStyle = function(word, token) {
  return ['<span class="sh-',token,'">',word,'</span>'].join('');
}

export default HtmlParser;
