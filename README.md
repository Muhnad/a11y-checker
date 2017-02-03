# a11y checker

Warn about HTML Markup code accessibility issue.
![a11y](a11y.png?raw=true "a11y")


## Usage

**First**, Download the `a11y.js`

**Second**, include it before `</body>`

```html
<script src="a11y.js"></script>
```

OR can use CDN link:

```html
<script src="https://cdn.rawgit.com/Muhnad/a11y-checker/master/a11y.js"></script>
```

**Third**, open the console.


## A11y check: 

1. Doctype.
2. Language Attribute.
3. Charset meta tag.
4. Page title.
5. Print style file.
6. Heading Element.
    1. H1 exist one time.
    2. Document outline.
7. Images
    1. Image src.
    2. Image alt. 
8. Links
    1. Skip nav.
    2. Link src.
    3. Link explain
    4. Link aria
9. Elements Roles
    1. Header.
    2. Nav.
        1. Nav label.
    3. Main.
    4. Footer.
    6. Aside.
    7. Aside label.
    8. Form
        1. Form label.
    9. Svg
10. Label.
    1. For.
    2. For value.
11. Inputs.
    1. Type.
    2. Placeholders.
    3. Label.
12. Iframe.
    1. Iframe src.
    2. Iframe title.
13. Buttons.
    1. Button value.
14. Abbrs.
    1. Abbr title.
15. Optgroups.
    1. Optgroup label.
    2. Optgroup value.
15. Tabindex.
    1. Tabindex value.

## License

MIT