/* */
export default function (themes, mainClass, themePrefix) {
  var styleId = 'simple-higlight-styles';
  // Styles aready added
  if (document.getElementById(styleId)) {
    return;
  }

  var cssArr = [];
  cssArr.push('code'+mainClass+' { font-size: 16px; padding: 15px;line-height:1.4;');
  cssArr.push('display: block; margin: 5px; border-radius:4px}');
  cssArr.push(mainClass + ' > pre { margin: 0;font-family: Monospace;overflow-x: auto; }');
  cssArr.push(mainClass +' .sh-lines{float:left;line-height:inherit;text-align:right;margin-right:15px;left:10px;');
  cssArr.push('border-right:1px solid #ccc; padding-right: 5px;user-select: none;}');

  for (var t = 0; t < themes.length; t++) {
      createThemeCss(themes[t], cssArr);
  }
  var css = cssArr.join('\n');
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  style.id = styleId;
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);

  function createThemeCss(theme, css) {
    var prefixName = mainClass + themePrefix + theme.name;
    css.push(prefixName + ' { background: '+theme.background+'}');
    css.push(prefixName + ' > pre {color: '+theme.text+'}');
    css.push(prefixName + ' .sh-lines {color: '+theme.linesCount+';border-color:'+theme.linesCount+'}');

    var s, m, color, font, style, lang;
    for (var lang in theme.styles) {
      for (var type in theme.styles[lang]) {
        s = theme.styles[lang][type].split('|');
        color = s[0];
        font = s[1];
        style = 'color:' + theme.colors[color];
        // If additional option exists
        if (font) {
          for (m = 0; m < font.length; m++) {
            if (font[m] === 'i') {
              style += ';font-style: italic';
            } else if(font[m] === 'b') {
              style += ';font-weight: bold';
            }
          }
        }
        css.push(prefixName+' .sh-'+lang+'-'+type+' {'+style+'}');
      }
    }
  }
}