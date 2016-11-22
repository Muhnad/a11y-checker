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
	  
	  if (!html.hasAttributes("lang")) {
	    console.log(`⚠️ Should add lang attribute to html element!`);
	  }
	})();

	const checkAltInImages = (function () {
	  const img = document.getElementsByTagName("img")
	  for (let i = 0; i < img.length; i++) {
	    if (!img[i].hasAttribute("alt")) {
	      console.log(`⚠️ Should add alt to this image src:  ${img[i].src}`);
	    }
	  }
	})();

	const checkHeaderRole = (function () {
		const header = document.getElementsByTagName("header")[0];
		if(!header.hasAttribute("role")) {
			console.log(`⚠️ Should add role=banner to header!`)
		}
	})();

	const checkNavRole = (function () {
	  const nav = document.getElementsByTagName("nav")
	  for (let i = 0; i < nav.length; i++) {
	    if (!nav[i].hasAttribute("role")) {
	      console.log(`⚠️ Should add role=navigation to nav id: ${nav[i].id} & class: ${nav[i].className}`);
	    }
	  }
	})();

	const checkMainRole = (function () {
		const main = document.getElementsByTagName("main")[0];
		if(!main.hasAttribute("role")) {
			console.log(`⚠️ Should add role=main to main!`)
		}
	})();

	const checkFooterRole = (function () {
		const footer = document.getElementsByTagName("footer")[0];
		if(!footer.hasAttribute("role")) {
			console.log(`⚠️ Should add role=contentinfo to footer!`)
		}
	})();

	const checkArticleRole = (function () {
	  const article = document.getElementsByTagName("article")
	  for (let i = 0; i < article.length; i++) {
	    if (!article[i].hasAttribute("role")) {
	      console.log(`⚠️ Should add role=article to article id: ${article[i].id} & class: ${article[i].className}`);
	    }
	  }
	})();

	const checkAsideRole = (function () {
	  const aside = document.getElementsByTagName("aside")
	  for (let i = 0; i < aside.length; i++) {
	    if (!aside[i].hasAttribute("role")) {
	      console.log(`⚠️ Should add role=complementary to aside id: ${aside[i].id} & class: ${aside[i].className}`);
	    }
	  }
	})();	

	const checkFormRole = (function () {
	  const form = document.getElementsByTagName("form")
	  for (let i = 0; i < form.length; i++) {
	    if (!form[i].hasAttribute("role")) {
	      console.log(`⚠️ Should add role=form to form id: ${form[i].id} & class: ${form[i].className}`);
	    }
	  }
	})();

}


window.onload = a11yChecker()