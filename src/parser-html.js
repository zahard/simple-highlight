import { parseRegExp, applyStyle } from './base';
import JsParser from './parser-js';
import CssParser from './parser-css';

var HtmlParser = {
  regTags: /<[^\>]+>/g,
  regTagParts: /^(<\/?)([a-zA-Z\-0-9]+)([^\>]*?)(\/?>)$/,
  regAttrs: /([a-zA-Z\-\_\*\$]+)(((=)(([\'\"])[^\6]*?\6))|\s)?/g,
  TOKENS: {
    tag: 'html-tag',
    attrName: 'html-name',
    attrVal: 'html-val',
    comment: 'html-comment',
  }
};

HtmlParser.parse = function(html) {
  //Check for comment start
  var startComment = html.indexOf('<!--');
  var startFrom = (startComment !== -1) ? startComment + 4 : 0
  var commentEnd = html.indexOf('-->');
  var end = (commentEnd !== -1) ? commentEnd - startFrom : undefined;
  html = html.substr(startFrom, end);

  //Unescape HTML special chars
  html = this.unescape(html);

  return parseRegExp({
    reg: this.regTags,
    text: html,
    match: this.parseHtmlTag.bind(this),
    noMatch: function(text, match) {
      // Process inline script and style tags
      var res;
      switch (match[0]) {
        case '</script>':
          res = '<span class="inline-js">'+JsParser.parse(text)+'</span>';
          break;
        case  '</style>':
          res = CssParser.parse(text);
          break;
        default:
          res = text;
      }
      return res;
    }
  });
}

HtmlParser.parseHtmlTag = function(tag) {
  var match = this.regTagParts.exec(tag[0]);
  if (!match) {
    return this.replaceHtmlChars(tag[0]);
  }
  var tagName = match[2];
  var tagAttrs = match[3];  
  return [
    this.replaceHtmlChars(match[1]), // < char
    applyStyle(tagName, this.TOKENS.tag),
    this.parseHtmlAttrs(tagAttrs),
    this.replaceHtmlChars(match[4]) // /> char
  ].join('');
}

HtmlParser.parseHtmlAttrs = function(attrs) {
  return parseRegExp({
    reg: this.regAttrs,
    text: attrs,
    match: this.highlightAttr.bind(this)
  });
}

HtmlParser.highlightAttr = function(attr) {
  var attrStr = [];

  // Attribute name
  attrStr.push(applyStyle(attr[1], this.TOKENS.attrName));
  // If attribute has value
  if (attr[4]) {
    // = char
    attrStr.push(attr[4]);
    // Attribute value
    attrStr.push(applyStyle(attr[5], this.TOKENS.attrVal));

  } else if(attr[2]) {
    // Empty space after attribute without value
    attrStr.push(attr[2]);
  }
  return attrStr.join('');
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

HtmlParser.unescape = function(html) {
  var el = document.createElement('div');
  return html.replace(/\&[#0-9a-z]+;/gi, function (enc) {
      el.innerHTML = enc;
      return el.innerText
  });
}

export default HtmlParser;
