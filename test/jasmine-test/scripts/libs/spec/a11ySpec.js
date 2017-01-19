describe('A11y checker', function () {

  describe('get element', function () {
      it('elelemnt should return value', function () {
        expect([...getElement('body')][0].localName).toEqual('body');
      });
  });

  describe('Page Doctype type', function () {
      it('elelemnt should defined', function () {
          expect(checkDoctype()).toBeDefined();
      });
      it('elelemnt should return html', function () {
          expect(checkDoctype().name).toBe('html');
      });        
  });

  describe('page meta charset', function () {
    it('meta should defined', function () {
      expect(checkCharsetMeta()).toBeDefined();
    });
  });

  describe('page title', function () {
    it('should page have title', function () {
      expect(checkPageTitle()).not.toBe(null);
    });
  });

  describe('heading in the page', function () {
    it('should page have one H1', function () {
      expect(checkHeading()).toEqual(1);
    });
    it('should the second heading after h1 be H2', function () {
      expect(checkDocumentOutline()).toBe('H2');
    });      
  });

  describe('aria roles', function () {
    it('header have role', function () {
      expect(checkHeaderRole().hasAttribute('role')).toBe(true);
    });
    it('header role equal banner', function () {
      expect(checkHeaderRole().getAttribute('role')).toBe('banner');
    });

    it('navigation have role', function () {
      expect(checkNavRole()[0].hasAttribute('role')).toBe(true);
    });
    it('navigation role equal navigation', function () {
      expect(checkNavRole()[0].getAttribute('role')).toBe('navigation');
    }); 

    it('main have role', function () {
      expect(checkMainRole().hasAttribute('role')).toBe(true);
    });
    it('main role equal main', function () {
      expect(checkMainRole().getAttribute('role')).toBe('main');
    });

    it('footer have role', function () {
      expect(checkFooterRole().hasAttribute('role')).toBe(true);
    });
    it('footer role equal contentinfo', function () {
      expect(checkFooterRole().getAttribute('role')).toBe('contentinfo');
    });

    it('section have role', function () {
      expect(checkSectionRole()[0].hasAttribute('role')).toBe(true);
    });
    it('section role equal region', function () {
      expect(checkSectionRole()[0].getAttribute('role')).toBe('region');
    });

    it('article have role', function () {
      expect(checkArticleRole()[0].hasAttribute('role')).toBe(true);
    });
    it('article role equal article', function () {
      expect(checkArticleRole()[0].getAttribute('role')).toBe('article');
    });

    it('aside have role', function () {
      expect(checkAsideRole()[0].hasAttribute('role')).toBe(true);
    });
    it('aside role equal complementary', function () {
      expect(checkAsideRole()[0].getAttribute('role')).toBe('complementary');
    });

    it('figure have role', function () {
      expect(checkFigureRole()[0].hasAttribute('role')).toBe(true);
    });
    it('figure role equal group', function () {
      expect(checkFigureRole()[0].getAttribute('role')).toBe('group');
    });

    it('form have role', function () {
      expect(checkFormRole()[0].hasAttribute('role')).toBe(true);
    });
    it('form role equal form', function () {
      expect(checkFormRole()[0].getAttribute('role')).toBe('form');
    });
  });

  describe('page Iframe', function () {
    it('Iframe should have src' , function () {
      expect(checkIframe()[0].getAttribute('src')).not.toBe(null)
    });
  });

});