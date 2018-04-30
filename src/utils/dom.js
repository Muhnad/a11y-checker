const getElement = element => document.querySelector(element);
const getElements = element => document.querySelectorAll(element);

const hasAttribute = (element, attribute) => element.hasAttribute(attribute);
const getAttribute = (element, attribute) => element.getAttribute(attribute);

const doctype = document.doctype;
const title = document.title;


const hasAccessibileText = element => hasAttribute(element, 'aria-label') || hasAttribute(element, 'aria-labelledby');

const hasTrack = track => track.textTracks.length === 0;

export {
  getElement, getElements,
  hasAttribute, getAttribute,
  doctype, title,
  hasAccessibileText, hasTrack
};
