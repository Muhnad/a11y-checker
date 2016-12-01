const a11yChecker = function () {
    "use strict";

    const checkLangAttr = (function () {
        const html = document.getElementsByTagName("html")[0];
        if (html) {
            if (html.hasAttribute("lang")) {
                const htmlLang = html.getAttribute("lang");
                if (htmlLang === null || htmlLang === "") {
                    console.log(`⚠️ Should add lang attribute to html element!`);
                }
            } else {
                console.log(`⚠️ Should add lang attribute to html element!`);
            }
        }
    })();

    const checkMeta = (function () {
        const metaCharset = document.getElementsByTagName("meta")[0];
        if (metaCharset) {
            if (!metaCharset.hasAttribute("charset")) {
                console.log(`⚠️ Should add meta charset=utf-8 to document!`);
            }
        } else {
            console.log(`⚠️ Should add meta charset=utf-8 to document!`);
        }
    })();

    const checkPageTitle = (function () {
        const pageTitle = document.title;
        if (pageTitle === null || pageTitle === "") {
            console.log(`⚠️ Should add title to describe the page content!`)
        }
    })();

    const checkPrintStyle = (function () {
        const link = document.getElementsByTagName("link");
        for (let i = 0; i < link.length; i++) {
            if (link[i].hasAttribute("media") >= 0) {
                const linkMedia = link[i].getAttribute("media");
                if (linkMedia !== "print") {
                    console.log(`⚠️ Should add print style file to document.`);
                }
            } else {
                console.log(`⚠️ Should add print style file to document.`);
            }
        }
    })();

    const checkHeading = (function () {
        const heading = document.getElementsByTagName("h1"),
              headingLength = heading.length;
        if (headingLength > 1) {
            console.log(`⚠️ Should h1 exist in page once usually in logo!`)
        }
    })();

    const checkImages = (function () {
        const img = document.getElementsByTagName("img");
        for (let i = 0; i < img.length; i++) {
            if (img[i].hasAttribute("src")) {
                const imgSrc = img[i].getAttribute("src");
                if (imgSrc === null || imgSrc === "") {
                    console.log(`⚠️ Should add src=value to the image id: ${img[i].id} & class: ${img[i].className}`);
                }
                if (!img[i].hasAttribute("alt")) {
                    console.log(`⚠️ Should add alt to the image src: ${img[i].src}`);
                }                
           } else {
            console.log(`⚠️ Should add src to the image id: ${img[i].id} & class: ${img[i].className}`);
           }            
        }
    })();

    const checkLinks = (function () {
        const anchor = document.getElementsByTagName("a"),
              firstAnchor = anchor[0],
              firstAnchorText = firstAnchor.textContent.toLowerCase(),
              listCommonWords = ["more", "click", "click here", "continue", "go", "here"],
              listSkipWords = ["skip navigation", "skip nav", "skip to navigation", "skip main navigation", "skip to content", "skip to main content","skip to search"];
        if (listSkipWords.indexOf(firstAnchorText) < 0) {
            console.log(`⚠️ Should add skip to main content link!`)
        }
        for (let i = 0; i < anchor.length; i++) {
            const anchorText = anchor[i].textContent.toLowerCase(),
                  anchorHref = anchor[i].getAttribute("href");
            if (anchorHref === null || anchorHref === "") {
                console.log(`⚠️ Should add href=value to anchor tag id: ${anchor[i].id} & class: ${anchor[i].className}`);
            }
            if (listCommonWords.indexOf(anchorText) >= 0) {
                console.log(`⚠️ Should link have a meaningful text to explain where the link goes! link text: ${anchor[i].textContent} & href: ${anchor[i].href}`)
            }                  
            if (anchor[i].hasAttribute("target")) {
                const anchorTarget = anchor[i].getAttribute("target");
                if (anchorTarget === "_blank") {
                     console.log(`⚠️ Should add alert to recognize this link will open in new tab. src: ${anchor[i].href}`)
                }
            }
        }   
    })();

    const checkHeaderRole = (function () {
        const header = document.getElementsByTagName("header")[0];
        if (header) {
            if (header.hasAttribute("role")) {
                const headerRole = header.getAttribute("role");
                if (headerRole !== "banner") {
                    console.log(`⚠️ Should add role=banner to header!`);
                }
            } else {
                console.log(`⚠️ Should add role=banner to header!`);
            }
        }
    })();

    const checkNavRole = (function () {
        const nav = document.getElementsByTagName("nav")
        for (let i = 0; i < nav.length; i++) {
            if (nav[i].hasAttribute("role")) {
                const navRole = nav[i].getAttribute("role");
                if (navRole !== "navigation") {
                    console.log(`⚠️ Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
                }
            } else {
                console.log(`⚠️ Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
            }
        }
    })();

    const checkMainRole = (function () {
        const main = document.getElementsByTagName("main")[0];
        if (main) {
            if (main.hasAttribute("role")) {
                const mainRole = main.getAttribute("role");
                if (mainRole !== "main") {
                    console.log(`⚠️ Should add role=main to main!`);
                }
            } else {
                console.log(`⚠️ Should add role=main to main!`);
            }
        }
    })();

    const checkFooterRole = (function () {
        const footer = document.getElementsByTagName("footer")[0];
        if (footer) {
            if (footer.hasAttribute("role")) {
                const footerRole = footer.getAttribute("role");
                if (footerRole !== "contentinfo") {
                    console.log(`⚠️ Should add role=contentinfo to footer!`);
                }
            } else {
                console.log(`⚠️ Should add role=contentinfo to footer!`);
            }
        }
    })();

    const checkSectionRole = (function () {
        const section = document.getElementsByTagName("section")
        for (let i = 0; i < section.length; i++) {
            if (section[i].hasAttribute("role")) {
                const sectionRole = section[i].getAttribute("role");
                if (sectionRole !== "region") {
                    console.log(`⚠️ Should add role=region to section id: ${section[i].id} & class: ${section[i].className}`);
                }
            } else {
                console.log(`⚠️ Should add role=region to section id: ${section[i].id} & class: ${section[i].className}`);
            }
            if (!section[i].hasAttribute("aria-labelledby")) {
                console.log(`⚠️ Should add aria-labelledby to section id: ${section[i].id} & class: ${section[i].className}`);
            }
        }
    })();

    const checkArticleRole = (function () {
        const article = document.getElementsByTagName("article")
        for (let i = 0; i < article.length; i++) {
            if (article[i].hasAttribute("role")) {
                const articleRole = article[i].getAttribute("role");
                if (articleRole !== "article") {
                    console.log(`⚠️ Should add role=article to article id: ${article[i].id} & class: ${article[i].className}`);
                }
            } else {
                console.log(`⚠️ Should add role=article to article id: ${article[i].id} & class: ${article[i].className}`);
            }
        }
    })();

    const checkAsideRole = (function () {
        const aside = document.getElementsByTagName("aside")
        for (let i = 0; i < aside.length; i++) {
            if (aside[i].hasAttribute("role")) {
                const asideRole = aside[i].getAttribute("role");
                if (asideRole !== "complementary") {
                    console.log(`⚠️ Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
                }
            } else {
                console.log(`⚠️ Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
            }
            if (!aside[i].hasAttribute("aria-labelledby")) {
                console.log(`⚠️ Should add aria-labelledby to aside id: ${aside[i].id} & class: ${aside[i].className}`);
            }
        }
    })();

    const checkFigureRole = (function () {
        const figure = document.getElementsByTagName("figure")
        for (let i = 0; i < figure.length; i++) {
            if (figure[i].hasAttribute("role")) {
                const figureRole = figure[i].getAttribute("role");
                if (figureRole !== "group") {
                    console.log(`⚠️ Should add role=group to figure id: ${figure[i].id} & class: ${figure[i].className}`);
                }
            } else {
                console.log(`⚠️ Should add role=group to figure id: ${figure[i].id} & class: ${figure[i].className}`);
            }
            if (!figure[i].hasAttribute("aria-labelledby")) {
                console.log(`⚠️ Should add aria-labelledby to figure id: ${figure[i].id} & class: ${figure[i].className}`);
            }
        }
    })();

    const checkFormRole = (function () {
        const form = document.forms;
        for (let i = 0; i < form.length; i++) {
            if (form[i].hasAttribute("role")) {
                const formRole = form[i].getAttribute("role");
                if (formRole !== "form" && formRole !== "search") {
                    console.log(`⚠️ Should add role=form OR role=search to form id: ${form[i].id} & class: ${form[i].className}`);
                }
            } else {
                console.log(`⚠️ Should add role=form OR role=search to form id: ${form[i].id} & class: ${form[i].className}`);
            }
            if (!form[i].hasAttribute("aria-labelledby")) {
                console.log(`⚠️ Should add aria-labelledby to form id: ${form[i].id} & class: ${form[i].className}`);
            }
        }
    })();

    const checkLabelRole = (function () {
        const label = document.getElementsByTagName("label");
        for (let i = 0; i < label.length; i++) {
            const labelChildLeng = label[i].children.length;
            if (labelChildLeng === 0 || labelChildLeng >= 2) {
                if (label[i].hasAttribute("for")) {
                    const labelRole = label[i].getAttribute("for");
                    if (labelRole === null || labelRole === "") {
                        console.log(`⚠️ Should add for=value to label: ${label[i].innerHTML}`);
                    }
                } else {
                    console.log(`⚠️ Should add for=value to label: ${label[i].innerHTML}`);
                }
            }
        }
    })();

    const checkInputs = (function () {
        const input = document.getElementsByTagName("input");
        for (let i = 0; i < input.length; i++) {
            if (input[i].hasAttribute("type")) {
               const inputTypeVal = input[i].getAttribute("type");
               if (inputTypeVal === "submit" || inputTypeVal === "reset") {
                 if (!input[i].hasAttribute("value")) {
                    console.log(`⚠️ Should Add value=value to input id: ${input[i].id}`);
                 }
               }
            } else {
                console.log(`⚠️ Should Add type=value to input id: ${input[i].id}`); 
            }
            if (input[i].hasAttribute("placeholder")) {
                console.log(`⚠️ the placeholder is not guaranteed to be read by assisitive technologies, should include aria-label OR label for element. \n placeholder: ${input[i].placeholder} & id: ${input[i].id}`);
            }
        }
    })();

    const checkIframe = (function () {
        const iframe = document.getElementsByTagName("iframe")
        for (let i = 0; i < iframe.length; i++) {
            if (iframe[i].hasAttribute("src")) {
                const iframeSrc = iframe[i].getAttribute("src");
                if (iframeSrc === null || iframeSrc === "") {
                    console.log(`⚠️ Should add src=value to iframe id: ${iframe[i].id}`);
                }
                if (iframe[i].hasAttribute("title")) {
                    const iframeTitle = iframe[i].getAttribute("title");
                    if (iframeTitle === null || iframeTitle === "") {
                        console.log(`⚠️ Should add title=value to iframe id: ${iframe[i].id} & src: ${iframe[i].src}`);
                    }
                } else {
                    console.log(`⚠️ Should add title to iframe id: ${iframe[i].id} & src: ${iframe[i].src}`);
                }                
            } else {
                console.log(`⚠️ Should add src to iframe id: ${iframe[i].id}`);
            }
        }
    })();

    const checkButtons = (function () {
        const btn = document.getElementsByTagName("button");
        for (let i = 0; i < btn.length; i++) {
            const btnText = btn[i].textContent;
            if (btnText === null || btnText === "") {
                console.log(`⚠️ Should add text to button id: ${btn[i].id} & class ${btn[i].className}`);
            }
        }
    })();

    const checkAbbrTitle = (function () {
        const abbr = document.getElementsByTagName("abbr");
        for (let i = 0; i < abbr.length; i++) {
            if (abbr[i].hasAttribute("title")) {
                const abbrTitle = abbr[i].getAttribute("title");
                if (abbrTitle === null || abbrTitle === "") {
                    console.log(`⚠️ Should add title=value to abbr id: ${abbr[i].id}`);
                }
            } else {
                console.log(`⚠️ Should add title to abbr id: ${abbr[i].id}`)
            }
        }
    })();

    const checkOptgroup = (function () {
        const optgroup = document.getElementsByTagName("optgroup");
        for (let i = 0; i < optgroup.length; i++) {
            if (optgroup[i].hasAttribute("label")) {
                const optLabel = optgroup[i].getAttribute("label");
                if (optLabel === null || optLabel === "") {
                    console.log(`⚠️ Should add label=value to optgroup: ${optgroup[i].innerHTML}`);
                }
            } else {
                console.log(`⚠️ Should add label to optgroup: ${optgroup[i].innerHTML}`);
            }
        }
    })();    

    const checkTabindexVal = (function () {
        const allElements = document.querySelectorAll("*");
        for (let i = 0; i < allElements.length; i++) {
            if (allElements[i].hasAttribute("tabindex")) {
                const tabIndexVal = allElements[i].getAttribute("tabindex");
                if (tabIndexVal >= 1) {
                    console.log(`⚠️ Avoid using positive integer values for tabindex id: ${allElements[i].id} & class: ${allElements[i].className}`)
                }
            }
        }
    })();

    const checkClickEvnt = (function () {
      const allElemetns = document.getElementsByTagName("*");
      for (let i = 0; i < allElemetns.length; i++) {
        if (allElemetns[i].hasAttribute("onclick") || allElemetns[i].hasAttribute("onClick")) {
          if (!allElemetns[i].hasAttribute("tabindex")) {
            console.log(`⚠️ Please add tabindex to element id: ${allElemetns[i].id} & class: ${allElemetns[i].className}`)
          }
        }
      }
    })();

}

a11yChecker()