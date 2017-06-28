'use strict';

const a11yChecker = () => {
  const warnMsg = msg => console.warn(msg);
  const getElement = element => document.querySelectorAll(element);

  const checkDoctype = (() => {
    const doctype = document.doctype;
    if (doctype) {
      const doctypeName = doctype.name;
      if (doctypeName.toLowerCase() !== 'html') {
        warnMsg('Should add doctype to document!');
      }
    } else {
      warnMsg('Should add doctype to document!');
    }
  })();

  const checkLangAttr = (() => {
    const html = getElement('html')[0];
    if (html) {
      if (html.hasAttribute('lang')) {
        const htmlLang = html.getAttribute('lang');
        if (htmlLang === null || htmlLang === '') {
          warnMsg('Should add lang=value attribute to html element!');
        }
      } else {
        warnMsg('Should add lang attribute to html element!');
      }
    }
  })();

  const checkCharsetMeta = (() => {
    const metaCharset = getElement('meta')[0];
    if (metaCharset) {
      if (!metaCharset.hasAttribute('charset')) {
        warnMsg('Should add meta charset=utf-8 to document!');
      }
    } else {
      warnMsg('Should add meta charset=utf-8 to document!');
    }
  })();

  const checkPageTitle = (() => {
    const pageTitle = document.title;
    if (pageTitle === null || pageTitle === '') {
      warnMsg('Should add title to describe the page content!');
    }
  })();

  const checkPrintStyle = (() => {
    const links = [...getElement('link')];

    links.forEach(link => {
      const linkStylesheet = link.getAttribute('rel');
      if (linkStylesheet === 'stylesheet') {
        if (link.hasAttribute('media') >= 0) {
          const linkMedia = link.getAttribute('media');
          if (linkMedia !== 'print') {
            warnMsg('Should add print style file to document.');
          }
        } else {
          warnMsg('Should add print style file to document.');
        }
      }
    });
  })();

  const checkHeading = (() => {
    const heading = getElement('h1');
    const headingLength = heading.length;
    if (headingLength > 1) {
      warnMsg('Should h1 exist in page once usually in logo!');
    }
  })();

  const checkDocumentOutline = (() => {
    const allHeadings = [...getElement('h1, h2, h3, h4, h5, h6')];
    const allHeadingNode = allHeadings.map(ele => ele.nodeName);
    const uniqueHeadings = [...new Set(allHeadingNode)];
    const headingsLength = uniqueHeadings.length;

    if (headingsLength >= 1) {
      if (uniqueHeadings[0] !== 'H1') {
        warnMsg('Should heading start with H1:h6');
      }
    }
    if (headingsLength >= 2) {
      if (uniqueHeadings[1] !== 'H2') {
        warnMsg('Should using H2 after H1 not any heading else.');
      }
    }
    if (headingsLength >= 3) {
      if (uniqueHeadings[2] !== 'H3') {
        warnMsg('Should using H3 after H2 not any heading else.');
      }
    }
    if (headingsLength >= 4) {
      if (uniqueHeadings[3] !== 'H4') {
        warnMsg('Should using H4 after H3 not any heading else.');
      }
    }
    if (headingsLength >= 5) {
      if (uniqueHeadings[4] !== 'H5') {
        warnMsg('Should using H5 after H4 not any heading else.');
      }
    }
  })();

  const checkImages = (() => {
    const imgs = [...getElement('img')];
    imgs.forEach(img => {
      if (img.hasAttribute('src')) {
        const imgSrc = img.getAttribute('src');
        const imgAlt = img.getAttribute('alt');

        if (imgSrc === null || imgSrc === '') {
          warnMsg(
            `Should add src=value to the image.
code: ${img.outerHTML}`
          );
        }

        if (img.hasAttribute('alt')) {
          const altLength = imgAlt.length;
          const altArrs = ['image', 'picture', 'logo'];
          const altTxts = altArrs.join(' ');
          const firstWordInAlt = imgAlt
            .split(' ')
            .slice(0, 1)
            .join('')
            .toLowerCase();

          if (altLength <= 5 && altLength !== 0) {
            warnMsg(
              `Should Image describe well.
code: ${img.outerHTML}`
            );
          }

          if (altTxts.indexOf(firstWordInAlt) > -1 && firstWordInAlt !== '') {
            warnMsg(
              `Should Image alt not start by words like image,picture,logo.
code: ${img.outerHTML}`
            );
          }
        } else {
          warnMsg(
            `Should add alt to the image.
code: ${img.outerHTML}`
          );
        }
      } else {
        warnMsg(
          `Should add src to the image.
code: ${img.outerHTML}`
        );
      }
    });
  })();

  const checkLinks = (() => {
    const anchors = [...getElement('a')];
    const firstAnchor = anchors[0];
    const listSkipWords = [
      'skip navigation',
      'skip nav',
      'skip to navigation',
      'skip main navigation',
      'skip to content',
      'skip to main content',
      'skip to search',
      'skip to sidebar'
    ];

    if (firstAnchor) {
      const firstAnchorText = firstAnchor.textContent.toLowerCase();
      if (listSkipWords.indexOf(firstAnchorText) < 0) {
        warnMsg('Should add skip to main content link!');
      }
    }

    anchors.forEach(anchor => {
      const anchorText = anchor.textContent.toLowerCase();
      const anchorHref = anchor.getAttribute('href');
      const listCommonWords = [
        'more',
        'click',
        'click here',
        'continue',
        'go',
        'here',
        'open link',
        'open'
      ];

      if (anchorHref === null || anchorHref === '') {
        warnMsg(
          `Should add href=value to anchor tag.
code: ${anchor.outerHTML}`
        );
      }

      if (listCommonWords.indexOf(anchorText) >= 0) {
        warnMsg(
          `Should link have a meaningful text to explain where the link goes!
code: ${anchor.outerHTML}`
        );
      }

      if (anchor.hasAttribute('target')) {
        const anchorTarget = anchor.getAttribute('target');
        if (anchorTarget === '_blank') {
          if (!anchor.hasAttribute('aria-describedby')) {
            warnMsg(
              `Should add alert to recognize this link will open in new tab.
code: ${anchor.outerHTML}`
            );
          }
          if (anchor.hasAttribute('rel')) {
            const anchorRel = anchor.getAttribute('rel');
            if (anchorRel !== 'noopener') {
              warnMsg(
                `Should add rel=noopener to 
code:${anchor.outerHTML}`
              );
            }
          } else {
            warnMsg(
              `Should add rel=noopener to
code: ${anchor.outerHTML}`
            );
          }
        }
      }
    });
  })();

  const checkHeaderRole = (() => {
    const header = getElement('header')[0];
    if (header) {
      if (header.hasAttribute('role')) {
        const headerRole = header.getAttribute('role');
        if (headerRole !== 'banner') {
          warnMsg('Should add role=banner to header!');
        }
      } else {
        warnMsg('Should add role=banner to header!');
      }
    }
  })();

  const checkNavRole = (() => {
    const navs = [...getElement('nav')];

    navs.forEach(nav => {
      if (nav.hasAttribute('role')) {
        const navRole = nav.getAttribute('role');
        if (navRole !== 'navigation') {
          warnMsg(
            ` Should add role=navigation to nav id: ${nav.id} & class: ${nav.className}`
          );
        }
      } else {
        warnMsg(
          ` Should add role=navigation to nav id: ${nav.id} & class: ${nav.className}`
        );
      }
      if (!nav.hasAttribute('aria-label')) {
        warnMsg(
          `Should add aria-label to nav id: ${nav.id} & class: ${nav.className}`
        );
      }
    });
  })();

  const checkMainRole = (() => {
    const main = getElement('main')[0];
    if (main) {
      if (main.hasAttribute('role')) {
        const mainRole = main.getAttribute('role');
        if (mainRole !== 'main') {
          warnMsg('Should add role=main to main!');
        }
      } else {
        warnMsg('Should add role=main to main!');
      }
    }
  })();

  const checkFooterRole = (() => {
    const footer = getElement('footer')[0];
    if (footer) {
      if (footer.hasAttribute('role')) {
        const footerRole = footer.getAttribute('role');
        if (footerRole !== 'contentinfo') {
          warnMsg('Should add role=contentinfo to footer!');
        }
      } else {
        warnMsg('Should add role=contentinfo to footer!');
      }
    }
  })();

  const checkSectionRole = (() => {
    const sections = [...getElement('section')];

    sections.forEach(section => {
      if (!section.hasAttribute('aria-labelledby')) {
        warnMsg(
          `Should add aria-labelledby to section id: ${section.id} & class: ${section.className}`
        );
      }
    });
  })();

  const checkAsideRole = (() => {
    const asides = [...getElement('aside')];

    asides.forEach(aside => {
      if (aside.hasAttribute('role')) {
        const asideRole = aside.getAttribute('role');
        if (asideRole !== 'complementary') {
          warnMsg(
            `Should add role=complementary to aside id: ${aside.id} & class: ${aside.className}`
          );
        }
      } else {
        warnMsg(
          `Should add role=complementary to aside id: ${aside.id} & class: ${aside.className}`
        );
      }
      if (!aside.hasAttribute('aria-labelledby')) {
        warnMsg(
          `Should add aria-labelledby to aside id: ${aside.id} & class: ${aside.className}`
        );
      }
    });
  })();

  const checkFormRole = (() => {
    const forms = [...document.forms];

    forms.forEach(form => {
      if (form.hasAttribute('role')) {
        const formRole = form.getAttribute('role');
        if (formRole !== 'form' && formRole !== 'search') {
          warnMsg(
            `Should add role=form OR role=search
code: ${form.outerHTML}`
          );
        }
      } else {
        warnMsg(
          `Should add role=form OR role=search
code: ${form.outerHTML}`
        );
      }
      if (!form.hasAttribute('aria-labelledby')) {
        warnMsg(
          `Should add aria-labelledby to form
code: ${form.outerHTML}`
        );
      }
    });
  })();

  const checkSvgRole = (() => {
    const svgs = [...getElement('svg')];

    svgs.forEach(svg => {
      if (svg.hasAttribute('role')) {
        const svgRole = svg.getAttribute('role');
        if (svgRole !== 'img') {
          warnMsg(
            `Should add role=img to svg id: ${svg.id} & class: ${svg.className.baseVal}`
          );
        }
      } else {
        warnMsg(
          `Should add role=img to svg id: ${svg.id} & class: ${svg.className.baseVal}`
        );
      }
    });
  })();

  const checkLabelRole = (() => {
    const labels = [...getElement('label')];

    labels.forEach(label => {
      const labelChildLeng = label.children.length;

      if (labelChildLeng === 0 || labelChildLeng >= 2) {
        if (label.hasAttribute('for')) {
          const labelRole = label.getAttribute('for');
          if (labelRole === null || labelRole === '') {
            warnMsg(`Should add for=value to label: ${label.outerHTML}`);
          }
        } else {
          warnMsg(`Should add for=value to label: ${label.outerHTML}`);
        }
      }
    });
  })();

  const checkInputs = (() => {
    const inputs = [...getElement('input')];

    inputs.forEach(input => {
      if (input.hasAttribute('type')) {
        const inputTypeVal = input.getAttribute('type');
        if (inputTypeVal === 'submit' || inputTypeVal === 'reset') {
          if (!input.hasAttribute('value')) {
            warnMsg(
              `Should Add value=value to input
code: ${input.outerHTML}`
            );
          }
        }
      } else {
        warnMsg(
          `Should Add type=value to input
code: ${input.outerHTML}`
        );
      }
      if (input.hasAttribute('placeholder')) {
        if (!input.hasAttribute('aria-label')) {
          warnMsg(
            `the placeholder is not guaranteed to be read by assisitive technology, should include aria-label OR label for element.
code: ${input.outerHTML}`
          );
        }
      }
    });
  })();

  const checkIframe = (() => {
    const iframes = [...getElement('iframe')];

    iframes.forEach(iframe => {
      if (iframe.hasAttribute('src')) {
        const iframeSrc = iframe.getAttribute('src');
        if (iframeSrc === null || iframeSrc === '') {
          warnMsg(
            `Should add src=value to iframe
  code: ${iframe.outerHTML}`
          );
        }
        if (iframe.hasAttribute('title')) {
          const iframeTitle = iframe.getAttribute('title');
          if (iframeTitle === null || iframeTitle === '') {
            warnMsg(
              `Should add title=value to iframe
  code: ${iframe.outerHTML}`
            );
          }
        } else {
          warnMsg(
            `Should add title to iframe
  code: ${iframe.outerHTML}`
          );
        }
      } else {
        warnMsg(
          `Should add src to iframe
  code: ${iframe.outerHTML}`
        );
      }
    });
  })();

  const checkButtons = (() => {
    const btns = [...getElement('button')];

    btns.forEach(btn => {
      const btnText = btn.textContent;
      if (btnText === null || btnText === '') {
        warnMsg(
          `Should add text to button
code: ${btn.outerHTML}`
        );
      }
    });
  })();

  const checkAbbrTitle = (() => {
    const abbrs = [...getElement('abbr')];

    abbrs.forEach(abbr => {
      if (abbr.hasAttribute('title')) {
        const abbrTitle = abbr.getAttribute('title');
        if (abbrTitle === null || abbrTitle === '') {
          warnMsg(
            `Should add title=value to abbr 
code: ${abbr.outerHTML}`
          );
        }
      } else {
        warnMsg(
          `Should add title to abbr 
code: ${abbr.outerHTML}`
        );
      }
    });
  })();

  const checkOptgroup = (() => {
    const optgroups = [...getElement('optgroup')];

    optgroups.forEach(optgroup => {
      if (optgroup.hasAttribute('label')) {
        const optLabel = optgroup.getAttribute('label');
        if (optLabel === null || optLabel === '') {
          warnMsg(
            `Should add label=value to optgroup
code: ${optgroup.outerHTML}`
          );
        }
      } else {
        warnMsg(
          `Should add label to optgroup
code: ${optgroup.outerHTML}`
        );
      }
    });
  })();

  const checkTabindexVal = (() => {
    const allElements = [...getElement('*')];

    allElements.forEach(allElement => {
      if (allElement.hasAttribute('tabindex')) {
        const tabIndexVal = allElement.getAttribute('tabindex');
        if (tabIndexVal >= 1) {
          warnMsg(
            `Avoid using positive integer values for tabindex
code: ${allElement.outerHTML}`
          );
        }
      }
    });
  })();

  const checkDuplicateId = (() => {
    const allElements = [...getElement('*')];
    const elementsId = allElements.map(elm => elm.getAttribute('id'));
    const sortedId = elementsId.sort();
    const duplicateId = [];
    for (let i = 0; i < elementsId.length - 1; i++) {
      if (sortedId[i + 1] === sortedId[i]) {
        duplicateId.push(sortedId[i]);
      }
    }
    const filterDuplicateId = duplicateId.filter(el => el !== null);
    const duplicateLength = filterDuplicateId.length;
    if (duplicateLength >= 1) {
      warnMsg(
        `Should ID be unique. 
duplicate id: ${filterDuplicateId}`
      );
    }
  })();
};
window.addEventListener('load', a11yChecker);
