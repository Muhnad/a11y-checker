const a11yChecker = function () {
    "use strict";

    const checkPageTitle = (function () {
        const pageTitle = document.title;
        if (pageTitle === null || pageTitle === "") {
            console.log(`⚠️ Should add title to page!`)
        }
    })();

    const checkLangAttr = (function () {
        const html = document.getElementsByTagName("html")[0];
        if (html.hasAttribute("lang")) {
            const htmlLang = html.getAttribute("lang");
            if (htmlLang === null || htmlLang === "") {
                console.log(`⚠️ Should add lang attribute to html element!`);
            }
        } else {
            console.log(`⚠️ Should add lang attribute to html element!`);
        }
    })();

    const checkPrintStyle = (function () {
        const link = document.getElementsByTagName("link");
        for (let i = 0; i < link.length; i++) {
            if (link[i].hasAttribute("media")) {
                if (link[i].getAttribute("media") !== "print") {
                    console.log(`⚠️ Should add print style file to document.`);
                }
            } else {
                console.log(`⚠️ Should add print style file to document.`);
            }
        }
    })();

    const checkAltInImages = (function () {
        const img = document.getElementsByTagName("img")
        for (let i = 0; i < img.length; i++) {
            if (!img[i].hasAttribute("alt")) {
                console.log(`⚠️ Should add alt to the image src:  ${img[i].src}`);
            }
        }
    })();

    const checkHref = (function () {
        const anchor = document.getElementsByTagName("a")
        for (let i = 0; i < anchor.length; i++) {
            const anchorVal = anchor[i].getAttribute("href");
            if (anchorVal === null || anchorVal === "") {
                console.log(`⚠️ Should add href=value to anchor tag id: ${anchor[i].id} & class: ${anchor[i].className}`);
            }
        }
    })();

    const checkHeaderRole = (function () {
        const header = document.getElementsByTagName("header")[0];
        if (header.hasAttribute("role")) {
            const headerRole = header.getAttribute("role");
            if (headerRole !== "banner") {
                console.log(`⚠️ Should add role=banner to header!`);
            }
        } else {
            console.log(`⚠️ Should add role=banner to header!`);
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
        if (main.hasAttribute("role")) {
            const mainRole = main.getAttribute("role");
            if (mainRole !== "main") {
                console.log(`⚠️ Should add role=main to main!`);
            }
        } else {
            console.log(`⚠️ Should add role=main to main!`);
        }
    })();

    const checkFooterRole = (function () {
        const footer = document.getElementsByTagName("footer")[0];
        if (footer.hasAttribute("role")) {
            const footerRole = footer.getAttribute("role");
            if (footerRole !== "contentinfo") {
                console.log(`⚠️ Should add role=contentinfo to footer!`);
            }
        } else {
            console.log(`⚠️ Should add role=contentinfo to footer!`);
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
}

window.onload = a11yChecker()