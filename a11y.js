const a11yChecker = () => {
  'use strict';

  const getElement = (element) => document.getElementsByTagName(element)
  
  const checkDoctype = (() => {
    const doctype = document.doctype;
    if (doctype) {
      const doctypeName = doctype.name;
      if (doctypeName.toLowerCase() !== 'html') {
        console.warn('Should add doctype to document!');
      }
    } else {
      console.warn('Should add doctype to document!');
    }
  })();
  
  const checkLangAttr = (() => {
      const html = getElement('html')[0];
      if (html) {
          if (html.hasAttribute('lang')) {
              const htmlLang = html.getAttribute('lang');
              if (htmlLang === null || htmlLang === '') {
                  console.warn('Should add lang=value attribute to html element!');
              }
          } else {
              console.warn('Should add lang attribute to html element!');
          }
      }
  })();

  const checkCharsetMeta = (() => {
      const metaCharset = getElement('meta')[0];
      if (metaCharset) {
          if (!metaCharset.hasAttribute('charset')) {
              console.warn('Should add meta charset=utf-8 to document!');
          }
      } else {
          console.warn('Should add meta charset=utf-8 to document!');
      }
  })();

  const checkPageTitle = (() => {
      const pageTitle = document.title;
      if (pageTitle === null || pageTitle === '') {
          console.warn('Should add title to describe the page content!')
      }
  })();

  const checkPrintStyle = (() => {
      const link = getElement('link');
      for (let i = 0; i < link.length; i++) {
        const linkStylesheet = link[i].getAttribute('rel');
        if (linkStylesheet === 'stylesheet') {
          if (link[i].hasAttribute('media') >= 0) {
              const linkMedia = link[i].getAttribute('media');
              if (linkMedia !== 'print') {
                  console.warn('Should add print style file to document.');
              }
          } else {
              console.warn('Should add print style file to document.');
          }
      }
    }
  })();

  const checkHeading = (() => {
      const heading = getElement('h1');
      const headingLength = heading.length;
      if (headingLength > 1) {
          console.warn('Should h1 exist in page once usually in warno!')
      }
  })();

  const checkImages = (() => {
      const img = getElement('img');
      for (let i = 0; i < img.length; i++) {
          if (img[i].hasAttribute('src')) {
              const imgSrc = img[i].getAttribute('src');
              if (imgSrc === null || imgSrc === '') {
                  console.warn(`Should add src=value to the image.
code: ${img[i].outerHTML}`);
              }
              if (!img[i].hasAttribute('alt')) {
                  console.warn(`Should add alt to the image.
code: ${img[i].outerHTML}`);
              }                
         } else {
          console.warn(`Should add src to the image.
code: ${img[i].outerHTML}`);
         }            
      }
  })();

  const checkLinks = (() => {
      const anchor = getElement('a');
      const firstAnchor = anchor[0];
      const listSkipWords = ['skip navigation', 'skip nav', 'skip to navigation', 'skip main navigation', 'skip to content', 'skip to main content','skip to search', 'skip to sidebar'];
      
      if (firstAnchor) {
        const firstAnchorText = firstAnchor.textContent.toLowerCase();        
          if (listSkipWords.indexOf(firstAnchorText) < 0) {
              console.warn('Should add skip to main content link!')
          }
      }

      for (let i = 0; i < anchor.length; i++) {
          const anchorText = anchor[i].textContent.toLowerCase();
          const anchorHref = anchor[i].getAttribute('href');
          const listCommonWords = ['more', 'click', 'click here', 'continue', 'go', 'here', 'open link', 'open'];
          
          if (anchorHref === null || anchorHref === '') {
              console.warn(`Should add href=value to anchor tag.
code: ${anchor[i].outerHTML}`);
          }
          
          if (listCommonWords.indexOf(anchorText) >= 0) {
              console.warn(`Should link have a meaningful text to explain where the link goes!
code: ${anchor[i].outerHTML}`)
          }                  
          
          if (anchor[i].hasAttribute('target')) {
              const anchorTarget = anchor[i].getAttribute('target');
              if (anchorTarget === '_blank') {
                if (!anchor[i].hasAttribute('aria-describedby')) {
                   console.warn(`Should add alert to recognize this link will open in new tab.
code: ${anchor[i].outerHTML}`);
              }
                if (anchor[i].hasAttribute('rel')) {
                  const anchorRel = anchor[i].getAttribute('rel');
                  if (anchorRel !== 'noopener') {
                    console.warn(`Should add rel=noopener to 
code:${anchor[i].outerHTML}`);
                  }
                } else {
                  console.warn(`Should add rel=noopener to
code: ${anchor[i].outerHTML}`);
                }            
            }
          }
      }
  })();

  const checkHeaderRole = (() => {
      const header = getElement('header')[0];
      if (header) {
          if (header.hasAttribute('role')) {
              const headerRole = header.getAttribute('role');
              if (headerRole !== 'banner') {
                  console.warn('Should add role=banner to header!');
              }
          } else {
              console.warn('Should add role=banner to header!');
          }
      }
  })();

  const checkNavRole = (() => {
      const nav = getElement('nav');
      for (let i = 0; i < nav.length; i++) {
          if (nav[i].hasAttribute('role')) {
              const navRole = nav[i].getAttribute('role');
              if (navRole !== 'navigation') {
                  console.warn(` Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
              }
          } else {
              console.warn(` Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
          }
          if (!nav[i].hasAttribute('aria-label')) {
              console.warn(`Should add aria-label to nav id: ${nav[i].id} & class: ${nav[i].className}`);
          }            
      }
  })();

  const checkMainRole = (() => {
      const main = getElement('main')[0];
      if (main) {
          if (main.hasAttribute('role')) {
              const mainRole = main.getAttribute('role');
              if (mainRole !== 'main') {
                  console.warn('Should add role=main to main!');
              }
          } else {
              console.warn('Should add role=main to main!');
          }
      }
  })();

  const checkFooterRole = (() => {
      const footer = getElement('footer')[0];
      if (footer) {
          if (footer.hasAttribute('role')) {
              const footerRole = footer.getAttribute('role');
              if (footerRole !== 'contentinfo') {
                  console.warn('Should add role=contentinfo to footer!');
              }
          } else {
              console.warn('Should add role=contentinfo to footer!');
          }
      }
  })();

  const checkSectionRole = (() => {
      const section = getElement('section');
      for (let i = 0; i < section.length; i++) {
          if (section[i].hasAttribute('role')) {
              const sectionRole = section[i].getAttribute('role');
              if (sectionRole !== 'region') {
                  console.warn(`Should add role=region to section id: ${section[i].id} & class: ${section[i].className}`);
              }
          } else {
              console.warn(`Should add role=region to section id: ${section[i].id} & class: ${section[i].className}`);
          }
          if (!section[i].hasAttribute('aria-labelledby')) {
              console.warn(`Should add aria-labelledby to section id: ${section[i].id} & class: ${section[i].className}`);
          }
      }
  })();

  const checkArticleRole = (() => {
      const article = getElement('article');
      for (let i = 0; i < article.length; i++) {
          if (article[i].hasAttribute('role')) {
              const articleRole = article[i].getAttribute('role');
              if (articleRole !== 'article') {
                  console.warn(`Should add role=article to article id: ${article[i].id} & class: ${article[i].className}`);
              }
          } else {
              console.warn(`Should add role=article to article id: ${article[i].id} & class: ${article[i].className}`);
          }
      }
  })();

  const checkAsideRole = (() => {
      const aside = getElement('aside');
      for (let i = 0; i < aside.length; i++) {
          if (aside[i].hasAttribute('role')) {
              const asideRole = aside[i].getAttribute('role');
              if (asideRole !== 'complementary') {
                  console.warn(`Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
              }
          } else {
              console.warn(`Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
          }
          if (!aside[i].hasAttribute('aria-labelledby')) {
              console.warn(`Should add aria-labelledby to aside id: ${aside[i].id} & class: ${aside[i].className}`);
          }
      }
  })();

  const checkFigureRole = (() => {
      const figure = getElement('figure');
      for (let i = 0; i < figure.length; i++) {
          if (figure[i].hasAttribute('role')) {
              const figureRole = figure[i].getAttribute('role');
              if (figureRole !== 'group') {
                  console.warn(`Should add role=group to figure id: ${figure[i].id} & class: ${figure[i].className}`);
              }
          } else {
              console.warn(`Should add role=group to figure id: ${figure[i].id} & class: ${figure[i].className}`);
          }
          if (!figure[i].hasAttribute('aria-labelledby')) {
              console.warn(`Should add aria-labelledby to figure id: ${figure[i].id} & class: ${figure[i].className}`);
          }
      }
  })();

  const checkFormRole = (() => {
      const form = document.forms;
      for (let i = 0; i < form.length; i++) {
          if (form[i].hasAttribute('role')) {
              const formRole = form[i].getAttribute('role');
              if (formRole !== 'form'&& formRole !== 'search') {
                  console.warn(`Should add role=form OR role=search
code: ${form[i].outerHTML}`);
              }
          } else {
              console.warn(`Should add role=form OR role=search
code: ${form[i].outerHTML}`);
          }
          if (!form[i].hasAttribute('aria-labelledby')) {
              console.warn(`Should add aria-labelledby to form
code: ${form[i].outerHTML}`);
          }
      }
  })();

  const checkLabelRole = (() => {
      const label = getElement('label');
      for (let i = 0; i < label.length; i++) {
          const labelChildLeng = label[i].children.length;
          if (labelChildLeng === 0 || labelChildLeng >= 2) {
              if (label[i].hasAttribute('for')) {
                  const labelRole = label[i].getAttribute('for');
                  if (labelRole === null || labelRole === '') {
                      console.warn(`Should add for=value to label: ${label[i].outerHTML}`);
                  }
              } else {
                  console.warn(`Should add for=value to label: ${label[i].outerHTML}`);
              }
          }
      }
  })();

  const checkInputs = (() => {
      const input = getElement('input');
      for (let i = 0; i < input.length; i++) {
          if (input[i].hasAttribute('type')) {
             const inputTypeVal = input[i].getAttribute('type');
             if (inputTypeVal === 'submit'|| inputTypeVal === 'reset') {
               if (!input[i].hasAttribute('value')) {
                  console.warn(`Should Add value=value to input
code: ${input[i].outerHTML}`);
               }
             }
          } else {
              console.warn(`Should Add type=value to input
code: ${input[i].outerHTML}`); 
          }
          if (input[i].hasAttribute('placeholder')) {
              console.warn(`the placeholder is not guaranteed to be read by assisitive technowarnies, should include aria-label OR label for element.
code: ${input[i].outerHTML}`);
          }
      }
  })();

  const checkIframe = (() => {
      const iframe = getElement('iframe');
      for (let i = 0; i < iframe.length; i++) {
          if (iframe[i].hasAttribute('src')) {
              const iframeSrc = iframe[i].getAttribute('src');
              if (iframeSrc === null || iframeSrc === '') {
                  console.warn(`Should add src=value to iframe
code: ${iframe[i].outerHTML}`);
              }
              if (iframe[i].hasAttribute('title')) {
                  const iframeTitle = iframe[i].getAttribute('title');
                  if (iframeTitle === null || iframeTitle === '') {
                      console.warn(`Should add title=value to iframe
code: ${iframe[i].outerHTML}`);
                  }
              } else {
                  console.warn(`Should add title to iframe
code: ${iframe[i].outerHTML}`);
              }                
          } else {
              console.warn(`Should add src to iframe
code: ${iframe[i].outerHTML}`);
          }
      }
  })();

  const checkButtons = (() => {
      const btn = getElement('button');
      for (let i = 0; i < btn.length; i++) {
          const btnText = btn[i].textContent;
          if (btnText === null || btnText === '') {
              console.warn(`Should add text to button
code: ${btn[i].outerHTML}`);
          }
      }
  })();

  const checkAbbrTitle = (() => {
      const abbr = getElement('abbr');
      for (let i = 0; i < abbr.length; i++) {
          if (abbr[i].hasAttribute('title')) {
              const abbrTitle = abbr[i].getAttribute('title');
              if (abbrTitle === null || abbrTitle === '') {
                  console.warn(`Should add title=value to abbr 
code: ${abbr[i].outerHTML}`);
              }
          } else {
              console.warn(`Should add title to abbr 
code: ${abbr[i].outerHTML}`)
          }
      }
  })();

  const checkOptgroup = (() => {
      const optgroup = getElement('optgroup');
      for (let i = 0; i < optgroup.length; i++) {
          if (optgroup[i].hasAttribute('label')) {
              const optLabel = optgroup[i].getAttribute('label');
              if (optLabel === null || optLabel === '') {
                  console.warn(`Should add label=value to optgroup
code: ${optgroup[i].outerHTML}`);
              }
          } else {
              console.warn(`Should add label to optgroup
code: ${optgroup[i].outerHTML}`);
          }
      }
  })();    

  const checkTabindexVal = (() => {
      const allElements = getElement('*');
      for (let i = 0; i < allElements.length; i++) {
          if (allElements[i].hasAttribute('tabindex')) {
              const tabIndexVal = allElements[i].getAttribute('tabindex');
              if (tabIndexVal >= 1) {
                  console.warn(`Avoid using positive integer values for tabindex
code: ${allElements[i].outerHTML}`)
              }
          }
      }
  })();

  const checkClickEvnt = (() => {
    const allElement = getElement('*');
    for (let i = 0; i < allElement.length; i++) {
      if (allElement[i].hasAttribute('onclick') || allElement[i].hasAttribute('onClick')) {
        if (!allElement[i].hasAttribute('tabindex')) {
          console.warn(`Please add tabindex to element id: ${allElement[i].id} & class: ${allElement[i].className}`)
        }
      }
    }
  })();
}
window.addEventListener('load', a11yChecker);