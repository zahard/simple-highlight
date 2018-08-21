# Simple Highlight
![alt text](https://raw.githubusercontent.com/zahard/simple-highlight/master/img/js.png)

Simple Highlight is small and lightweight syntax higlighter library.
  - Small size
  - Easy to include, just single javascript file
  - Highlight code on page load
  - Public method to highlight selected code tags
  - Dark and light themes
  - Javascript, HTML and CSS syntax
  - Support of inlined scripts and styles in HTML

## Examples
Check it in action on this [demo page](https://zahard.github.io/simple-highlight/index.html)

## Usage
First include script to your page
```html
<script src="path/to/simple.highlight.min.js"></script>
```
To autohiglight you code put it inside `<code><pre>`tags with `simple-highlight` class
```html
<code class="simple-highlight"><pre>
YOUR CODE TO HIGHLIGHT
</pre><code>
```
On page load script will find all `code` tags with `simple-highlight` class and apply highlighting to it

Optionally you can specify wich theme will be used with class `sh-theme-THEME_NAME`
Now available two themes: `dark` and `light`, and light is default one (so if no theme class specified this one will be used). 
Next example will highlight your code with dark theme on page load:
```html
<code class="simple-highlight sh-theme-dark"><pre>
YOUR CODE TO HIGHLIGHT
</pre><code>
```

Optinally this library expose global function `SimpleHighlight`, so if you have single page application, or other type of page, where this code snippets can appear dynamically, you can use this function to run highlight manually, just call
```js
SimpleHighlight();
```
Also you can specify DOM element to wich you want to apply highlight, by passing DOMNode and theme name as arguments
```js
const codeElement = document.querySelector('.my-special-code');
SimpleHighlight(codeElement, 'light');
```
It will add required classes automatically and process it, just be sure that you have `pre` tag inside
