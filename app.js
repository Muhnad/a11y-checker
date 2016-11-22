const a11yChecker = function () {
	"use strict";

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
	      console.log(`⚠️ Should add alt to this image:  ${img[i].src}`);
	    }
	  }
	})();

	const checkHeaderRole = (function () {
		const header = document.getElementsByTagName("header")[0];
		if(!header.hasAttribute("role")) {
			console.log(`⚠️ Should add role=banner to header!`)
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

}


window.onload = a11yChecker()