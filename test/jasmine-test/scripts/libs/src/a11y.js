'use strict';

  const warnMsg = (msg) => console.warn(msg);
  const getElement = (element) => document.querySelectorAll(element);
  
  const checkDoctype = () => {
    const doctype = document.doctype;
    if (doctype) {
      const doctypeName = doctype.name;
      if (doctypeName.toLowerCase() !== 'html') {
        warnMsg('Should add doctype to document!');
      }
    } else {
      warnMsg('Should add doctype to document!');
    }
    return doctype;
  };
  
  const checkLangAttr = () => {
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
  };

  const checkCharsetMeta = () => {
      const metaCharset = getElement('meta')[0];
      if (metaCharset) {
          if (!metaCharset.hasAttribute('charset')) {
              warnMsg('Should add meta charset=utf-8 to document!');
          }
      } else {
          warnMsg('Should add meta charset=utf-8 to document!');
      }
      return metaCharset;
  };

  const checkPageTitle = () => {
      const pageTitle = document.title;
      if (pageTitle === null || pageTitle === '') {
          warnMsg('Should add title to describe the page content!')
      }
      return pageTitle;
  };

  const checkPrintStyle = () => {
      const link = getElement('link');
      for (let i = 0; i < link.length; i++) {
        const linkStylesheet = link[i].getAttribute('rel');
        if (linkStylesheet === 'stylesheet') {
          if (link[i].hasAttribute('media') >= 0) {
              const linkMedia = link[i].getAttribute('media');
              if (linkMedia !== 'print') {
                  warnMsg('Should add print style file to document.');
              }
          } else {
              warnMsg('Should add print style file to document.');
          }
      }
    }
  };

  const checkHeading = () => {
      const heading = getElement('h1');
      const headingLength = heading.length;
      if (headingLength > 1) {
          warnMsg('Should h1 exist in page once usually in logo!')
      }
      return headingLength;
  };

  const checkDocumentOutline = () => {
    const allHeadings = [...getElement('h1, h2, h3, h4, h5, h6')];
    const allHeadingNode= allHeadings.map(ele => ele.nodeName);
    const uniqueHeadings = allHeadings.filter((item, pos) => allHeadingNode.indexOf(item.nodeName) === pos );
    const headingsLength = uniqueHeadings.length;
    
    if (headingsLength >= 1) {
      if (uniqueHeadings[0].nodeName !== 'H1') {
        warnMsg('Should heading start with H1:h6')
      }
    }
    if (headingsLength >= 2) {
      if (uniqueHeadings[1].nodeName !== 'H2') {
        warnMsg('Should using H2 after H1 not any heading else.')
      }    
    }
    if (headingsLength >= 3) { 
      if (uniqueHeadings[2].nodeName !== 'H3') {
        warnMsg('Should using H3 after H2 not any heading else.')
      }
    }
    if (headingsLength >= 4) {
      if (uniqueHeadings[3].nodeName !== 'H4') {
        warnMsg('Should using H4 after H3 not any heading else.')
      }
    }
    if (headingsLength >= 5) {
      if (uniqueHeadings[4].nodeName !== 'H5') {
        warnMsg('Should using H5 after H4 not any heading else.')
      }
    }
    return uniqueHeadings[1].nodeName;
  };
  
  const checkImages = () => {
      const img = getElement('img');
      for (let i = 0; i < img.length; i++) {
          if (img[i].hasAttribute('src')) {
              const imgSrc = img[i].getAttribute('src');
              const imgAlt = img[i].getAttribute('alt');            
            
              if (imgSrc === null || imgSrc === '') {
                  warnMsg(`Should add src=value to the image.
code: ${img[i].outerHTML}`);
              }
              if (img[i].hasAttribute('alt')) {
                const altLength = imgAlt.length;
                const altArrs = ['image', 'picture', 'logo'];
                const altTxts = altArrs.join(' ');
                const firstWordInAlt = imgAlt.split(' ')
                .slice(0,1).join('').toLowerCase();
             
                if (altLength <= 5 && altLength !== 0) {
                  warnMsg(`Should Image describe well.
code: ${img[i].outerHTML}`)
                }                
                if (altTxts.indexOf(firstWordInAlt) > -1) {
                  warnMsg(`Should Image alt not start by words like image,picture,logo.
code: ${img[i].outerHTML}`)
                }
              } else {
                warnMsg(`Should add alt to the image.
code: ${img[i].outerHTML}`);
              }
            
         } else {
          warnMsg(`Should add src to the image.
code: ${img[i].outerHTML}`);
         }            
      }
  };

  const checkLinks = () => {
      const anchor = getElement('a');
      const firstAnchor = anchor[0];
      const listSkipWords = ['skip navigation', 'skip nav', 'skip to navigation', 'skip main navigation', 'skip to content', 'skip to main content','skip to search', 'skip to sidebar'];
      
      if (firstAnchor) {
        const firstAnchorText = firstAnchor.textContent.toLowerCase();        
          if (listSkipWords.indexOf(firstAnchorText) < 0) {
              warnMsg('Should add skip to main content link!')
          }
      }

      for (let i = 0; i < anchor.length; i++) {
          const anchorText = anchor[i].textContent.toLowerCase();
          const anchorHref = anchor[i].getAttribute('href');
          const listCommonWords = ['more', 'click', 'click here', 'continue', 'go', 'here', 'open link', 'open'];
          
          if (anchorHref === null || anchorHref === '') {
              warnMsg(`Should add href=value to anchor tag.
code: ${anchor[i].outerHTML}`);
          }
          
          if (listCommonWords.indexOf(anchorText) >= 0) {
              warnMsg(`Should link have a meaningful text to explain where the link goes!
code: ${anchor[i].outerHTML}`)
          }                  
          
          if (anchor[i].hasAttribute('target')) {
              const anchorTarget = anchor[i].getAttribute('target');
              if (anchorTarget === '_blank') {
                if (!anchor[i].hasAttribute('aria-describedby')) {
                   warnMsg(`Should add alert to recognize this link will open in new tab.
code: ${anchor[i].outerHTML}`);
              }
                if (anchor[i].hasAttribute('rel')) {
                  const anchorRel = anchor[i].getAttribute('rel');
                  if (anchorRel !== 'noopener') {
                    warnMsg(`Should add rel=noopener to 
code:${anchor[i].outerHTML}`);
                  }
                } else {
                  warnMsg(`Should add rel=noopener to
code: ${anchor[i].outerHTML}`);
                }            
            }
          }
      }
  };

  const checkHeaderRole = () => {
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
      return header;
  };

  const checkNavRole = () => {
      const nav = getElement('nav');
      for (let i = 0; i < nav.length; i++) {
          if (nav[i].hasAttribute('role')) {
              const navRole = nav[i].getAttribute('role');
              if (navRole !== 'navigation') {
                  warnMsg(` Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
              }
          } else {
              warnMsg(` Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
          }
          if (!nav[i].hasAttribute('aria-label')) {
              warnMsg(`Should add aria-label to nav id: ${nav[i].id} & class: ${nav[i].className}`);
          }            
      }
      return nav;
  };

  const checkMainRole = () => {
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
      return main;
  };

  const checkFooterRole = () => {
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
      return footer;
  };

  const checkSectionRole = () => {
      const section = getElement('section');
      for (let i = 0; i < section.length; i++) {
          if (!section[i].hasAttribute('aria-labelledby')) {
              warnMsg(`Should add aria-labelledby to section id: ${section[i].id} & class: ${section[i].className}`);
          }
      }
      return section;
  }

  const checkAsideRole = () => {
      const aside = getElement('aside');
      for (let i = 0; i < aside.length; i++) {
          if (aside[i].hasAttribute('role')) {
              const asideRole = aside[i].getAttribute('role');
              if (asideRole !== 'complementary') {
                  warnMsg(`Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
              }
          } else {
              warnMsg(`Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
          }
          if (!aside[i].hasAttribute('aria-labelledby')) {
              warnMsg(`Should add aria-labelledby to aside id: ${aside[i].id} & class: ${aside[i].className}`);
          }
      }
      return aside;
  };


  const checkFormRole = () => {
      const form = document.forms;
      for (let i = 0; i < form.length; i++) {
          if (form[i].hasAttribute('role')) {
              const formRole = form[i].getAttribute('role');
              if (formRole !== 'form'&& formRole !== 'search') {
                  warnMsg(`Should add role=form OR role=search
code: ${form[i].outerHTML}`);
              }
          } else {
              warnMsg(`Should add role=form OR role=search
code: ${form[i].outerHTML}`);
          }
          if (!form[i].hasAttribute('aria-labelledby')) {
              warnMsg(`Should add aria-labelledby to form
code: ${form[i].outerHTML}`);
          }
      }
      return form;
  };

  const checkSvgRole = () => {
      const svg = getElement('svg');
      for (let i = 0; i < svg.length; i++) {
          if (svg[i].hasAttribute('role')) {
              const svgRole = svg[i].getAttribute('role');
              if (svgRole !== 'img') {
                  warnMsg(`Should add role=img to svg id: ${svg[i].id} & class: ${svg[i].className}`);
              }
          } else {
              warnMsg(`Should add role=img to svg id: ${svg[i].id} & class: ${svg[i].className}`);
          }
      }
      return svg;
  }

  const checkLabelRole = () => {
      const label = getElement('label');
      for (let i = 0; i < label.length; i++) {
          const labelChildLeng = label[i].children.length;
          if (labelChildLeng === 0 || labelChildLeng >= 2) {
              if (label[i].hasAttribute('for')) {
                  const labelRole = label[i].getAttribute('for');
                  if (labelRole === null || labelRole === '') {
                      warnMsg(`Should add for=value to label: ${label[i].outerHTML}`);
                  }
              } else {
                  warnMsg(`Should add for=value to label: ${label[i].outerHTML}`);
              }
          }
      }
  };

  const checkInputs = () => {
      const input = getElement('input');
      for (let i = 0; i < input.length; i++) {
          if (input[i].hasAttribute('type')) {
             const inputTypeVal = input[i].getAttribute('type');
             if (inputTypeVal === 'submit'|| inputTypeVal === 'reset') {
               if (!input[i].hasAttribute('value')) {
                  warnMsg(`Should Add value=value to input
code: ${input[i].outerHTML}`);
               }
             }
          } else {
              warnMsg(`Should Add type=value to input
code: ${input[i].outerHTML}`); 
          }
          if (input[i].hasAttribute('placeholder')) {
            if (!input[i].hasAttribute('aria-label')) {
                warnMsg(`the placeholder is not guaranteed to be read by assisitive technowarnies, should include aria-label OR label for element.
code: ${input[i].outerHTML}`);
            }
          }
      }
  };

  const checkIframe = () => {
      const iframe = getElement('iframe');
      for (let i = 0; i < iframe.length; i++) {
          if (iframe[i].hasAttribute('src')) {
              const iframeSrc = iframe[i].getAttribute('src');
              if (iframeSrc === null || iframeSrc === '') {
                  warnMsg(`Should add src=value to iframe
code: ${iframe[i].outerHTML}`);
              }
              if (iframe[i].hasAttribute('title')) {
                  const iframeTitle = iframe[i].getAttribute('title');
                  if (iframeTitle === null || iframeTitle === '') {
                      warnMsg(`Should add title=value to iframe
code: ${iframe[i].outerHTML}`);
                  }
              } else {
                  warnMsg(`Should add title to iframe
code: ${iframe[i].outerHTML}`);
              }                
          } else {
              warnMsg(`Should add src to iframe
code: ${iframe[i].outerHTML}`);
          }
      }
      return iframe;
  };

  const checkButtons = () => {
      const btn = getElement('button');
      for (let i = 0; i < btn.length; i++) {
          const btnText = btn[i].textContent;
          if (btnText === null || btnText === '') {
              warnMsg(`Should add text to button
code: ${btn[i].outerHTML}`);
          }
      }
      return btn;
  };

  const checkAbbrTitle = () => {
      const abbr = getElement('abbr');
      for (let i = 0; i < abbr.length; i++) {
          if (abbr[i].hasAttribute('title')) {
              const abbrTitle = abbr[i].getAttribute('title');
              if (abbrTitle === null || abbrTitle === '') {
                  warnMsg(`Should add title=value to abbr 
code: ${abbr[i].outerHTML}`);
              }
          } else {
              warnMsg(`Should add title to abbr 
code: ${abbr[i].outerHTML}`)
          }
      }
  };

  const checkOptgroup = () => {
      const optgroup = getElement('optgroup');
      for (let i = 0; i < optgroup.length; i++) {
          if (optgroup[i].hasAttribute('label')) {
              const optLabel = optgroup[i].getAttribute('label');
              if (optLabel === null || optLabel === '') {
                  warnMsg(`Should add label=value to optgroup
code: ${optgroup[i].outerHTML}`);
              }
          } else {
              warnMsg(`Should add label to optgroup
code: ${optgroup[i].outerHTML}`);
          }
      }
  };    

  const checkTabindexVal = () => {
      const allElements = getElement('*');
      for (let i = 0; i < allElements.length; i++) {
          if (allElements[i].hasAttribute('tabindex')) {
              const tabIndexVal = allElements[i].getAttribute('tabindex');
              if (tabIndexVal >= 1) {
                  warnMsg(`Avoid using positive integer values for tabindex
code: ${allElements[i].outerHTML}`)
              }
          }
      }
      return allElements;
  };

  const checkClickEvnt = () => {
    const allElement = getElement('*');
    for (let i = 0; i < allElement.length; i++) {
      if (allElement[i].hasAttribute('onclick') || allElement[i].hasAttribute('onClick')) {
        if (!allElement[i].hasAttribute('tabindex')) {
          warnMsg(`Please add tabindex to element id: ${allElement[i].id} & class: ${allElement[i].className}`)
        }
      }
    }
  };

  const checkDuplicateId = () => {
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
      warnMsg(`Should ID be unique. 
duplicate id: ${filterDuplicateId}`);
    } 
    return duplicateLength;
  }; 