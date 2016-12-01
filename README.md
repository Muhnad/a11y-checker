# a11y checker

Warn about HTML Markup code accessibility issue.
![a11y](a11y.png?raw=true "a11y")


## Usage

**First**, Download the `a11y.js`

**Second**, include it before `</body>`

```html
<script src="a11y.js"></script>
```

**Third**, open the console.


if you need to test your website or any website without download the file you can put this code in the console.

```javascript
var script = document.createElement("script");
script.type = "text/javascript";
script.src = "https://cdn.rawgit.com/Muhnad/a11y-checker/master/a11y.js";
document.body.appendChild(script);
```

Thanks to @Paul Adam for upload the script in rawgit.

## License

MIT