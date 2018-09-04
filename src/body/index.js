import {Warning} from '../utils/warn';
import {isEmpty, isNull} from '../utils/string';
import {
  getElements, hasAttribute, getAttribute,
  hasAccessibileText, hasTrack
} from '../utils/dom';


const hasHeadingOnce = () => {
  const H1 = getElements('h1');
  const hasMultiHeading = H1.length > 1;

  if (hasMultiHeading) Warning('Page has Multi <h1> tag. Fix: use only one <h1> in the page.');
};


const hasImagesAlt = () => {
  const IMGS = [...getElements('img')];
  const imagesWithoutAlt = IMGS.filter(img => !hasAttribute(img, 'alt'));
  const hasMissingAlt = imagesWithoutAlt.length > 0;
  const withoutAltWarning = imagesWithoutAlt.forEach(image => Warning(`Image Alt is missing. Fix: Add alt="IMAGE WELL DESCRIBED" to ${image.outerHTML}`));

  if (hasMissingAlt) withoutAltWarning;
};

const hasLinksText = () => {
  const LINKS = [...getElements('a')];
  const warningMessage = 'Link text is missing. Fix: DESCRIBE PURPOSE OF LINK';
  const linksWithoutText = LINKS.filter(link => isEmpty(link.textContent) && !hasAccessibileText(link));
  const hasMissingText = linksWithoutText.length > 0;
  const withoutTextWarning = linksWithoutText.forEach(link => Warning(`${warningMessage} to ${link.outerHTML}`));

  if (hasMissingText) withoutTextWarning;
};


const hasLinksHref = () => {
  const LINKS = [...getElements('a')];
  const linksWithoutHref = LINKS.filter(link => (!hasAttribute(link, 'href') || isEmpty(getAttribute(link, 'href'))) && !hasAttribute(link, 'role'));
  const hasMissingHref = linksWithoutHref.length > 0;
  const withoutHrefWarning = linksWithoutHref.forEach(link => Warning(`Link Href is missing. Fix: Add href="LINK URL" to ${link.outerHTML}`));

  if (hasMissingHref) withoutHrefWarning;
};


const hasLinksTarget = () => {
  const LINKS = [...getElements('a')];
  const warningMessage = 'Hint message is missing. Should add hint message to recognize this link will open in new tab. Fix: Add aria-describedby="ELEMENT ID"';
  const linksWithTarget = LINKS.filter(link => getAttribute(link, 'target') === '_blank' && !hasAttribute(link, 'aria-describedby'));
  const hasTarget = linksWithTarget.length > 0;
  const missingTargetHint = linksWithTarget.forEach(link => Warning(`${warningMessage} to ${link.outerHTML}`));

  if (hasTarget) missingTargetHint;
};


const hasButtonsText = () => {
  const BUTTONS = [...getElements('button')];
  const warningMessage = 'Button text or aria-label is missing. Fix: Add aria-label="VALUE" or <button>VALUE</button>';
  const buttonsWithoutText = BUTTONS.filter(button => isEmpty(button.textContent) && !hasAccessibileText(button));
  const hasMissingText = buttonsWithoutText.length > 0;
  const withoutTextWarning = buttonsWithoutText.forEach(button => Warning(`${warningMessage} to ${button.outerHTML}`));

  if (hasMissingText) withoutTextWarning;
};


const hasForLabel = () => {
  const LABELS = [...getElements('label')];
  const isLabeld = label => {
    if (!hasAttribute(label, 'for') || isEmpty(getAttribute(label, 'for')))
      Warning(`For is missing in label. Fix: Add for="INPUT ID" to ${label.outerHTML}`);
  };
  const missingForLabel = LABELS.forEach(isLabeld);

  return missingForLabel;
};


const hasSVGRole = () => {
  const SVGS = [...getElements('SVG')];
  const hasMissingRole = SVGS.some(svg => getAttribute(svg, 'aria-hidden') !== 'true' && !hasAttribute(svg, 'role') && !getAttribute(svg, 'id'));

  if (hasMissingRole) Warning('SVG Role is missing. Fix: Add role="img" or (aria-hidden="true" if you need to hide element from SR).');
};


const hasIframeTitle = () => {
  const IFRAMES = [...getElements('iframe')];
  const iframeWithoutTitle = IFRAMES.some(ifrmae => !hasAttribute(ifrmae, 'title'));

  if (iframeWithoutTitle) Warning('Title is missing in iframe. Fix: Add title="DESCRIBE CONTENT OF FRAME" to <iframe>');
};


const hasVideoTrack = () => {
  const VIDEOS = [...getElements('video')];
  const videoWithoutTrack = VIDEOS.some(hasTrack);

  if (videoWithoutTrack)  Warning('Video track is missing. Fix: Add <track> element with subtitles, captions to >video>');
};


const hasAudioTrack = () => {
  const AUDIOS = [...getElements('audio')];
  const audioWithoutTrack = AUDIOS.some(hasTrack);

  if (audioWithoutTrack)  Warning('Audio track is missing. Fix: Add <track> element with subtitles, captions to <audio>');
};


const hasFormsLabel = () => {
  const FORMS = [...getElements('form')];
  const formsWithoutLabels = FORMS.some(video => !hasAccessibileText(video));

  if (formsWithoutLabels) Warning('Forms Label is missing. Fix: Add aria-label, aria-labelledby to <form>');
};


const hasPositiveTabIndex = () => {
  const ALLELEMENTS = [...getElements('*')];
  const elementsWithTabindex = ALLELEMENTS.filter(element => getAttribute(element, 'tabindex') > 0);
  const hasPositiveindex = elementsWithTabindex.length > 0;

  if (hasPositiveindex) Warning('Avoid using positive integer values for tabindex. Fix: Remove/Replace tabindex=">0" ');
};


const hasDuplicateIds = () => {
  const ALLELEMENTS = [...getElements('*')];
  const elementsWithId = ALLELEMENTS
    .map(element => getAttribute(element, 'id'))
    .filter(el => !isNull(el));
  const uniqueIds = [...new Set(elementsWithId)];
  const hasDuplicate = elementsWithId.length > uniqueIds.length;

  if (hasDuplicate) Warning('Avoid duplicate ids, ID must be unique. Fix: Remove/Replace duplicate id');
};


export {
  hasHeadingOnce, hasImagesAlt, hasLinksText, hasLinksHref,
  hasLinksTarget, hasButtonsText, hasSVGRole, hasFormsLabel,
  hasIframeTitle, hasForLabel, hasVideoTrack, hasAudioTrack,
  hasPositiveTabIndex, hasDuplicateIds
};
