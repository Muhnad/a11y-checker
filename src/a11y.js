import * as head from './head';
import * as body from './body';

const a11yChecker = () => {
  head.hasDocumentType();
  head.hasDocumentTitle();
  head.hasDocumentLanguage();
  head.hasDocumentMetaCharset();
  head.hasDocumentScalable();

  body.hasHeadingOnce();
  body.hasImagesAlt();
  body.hasLinksText();
  body.hasLinksHref();
  body.hasLinksTarget();
  body.hasButtonsText();
  body.hasSVGRole();
  body.hasIframeTitle();
  body.hasFormsLabel();
  body.hasForLabel();
  body.hasVideoTrack();
  body.hasAudioTrack();
  body.hasPositiveTabIndex();
  body.hasDuplicateIds();
};

export default a11yChecker;
