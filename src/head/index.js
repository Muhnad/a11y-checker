import {Warning} from '../utils/warn';
import {isEmpty} from '../utils/string';
import {
  getElement, getElements,
  hasAttribute, getAttribute,
  doctype, title
} from '../utils/dom';


const hasDocumentType = () => {
  if (!doctype) Warning('Doctype is missing. Fix: Add <!DOCTYPE html>');
};


const hasDocumentTitle = () => {
  if (isEmpty(title)) Warning('Title is missing. Fix: <title>WELL DESCRIBED TITLE</title>');
};


const hasDocumentLanguage = () => {
  const HTML = getElement('html');
  const hasLanguageAttr = hasAttribute(HTML, 'lang');

  if (hasLanguageAttr) {
    const getLanguageValue = getAttribute(HTML, 'lang');
    const isLanguageValueNotExist = isEmpty(getLanguageValue);

    if (isLanguageValueNotExist) Warning('Language value is missing in HTML element. Fix: Add lang="LANGUAGE VALUE" to <html>');
  } else {
    Warning('Language is missing in HTML element. Fix: Add lang="LANGUAGE VALUE" to <html>');
  }
};


const hasDocumentMetaCharset = () => {
  const META = [...getElements('meta')];
  const hasMetaCharset = META.some(tag => hasAttribute(tag, 'charset'));

  if (!hasMetaCharset) Warning('Document encoding is missing. Fix: Add <meta charset="utf-8"/>');
};


const hasDocumentScalable = () => {
  const META = [...getElements('meta')];
  const hasMetaScalable = META.some(el => getAttribute(el, 'user-scalable') === 'no');

  if (hasMetaScalable) Warning('Document must not use the user-scalable=no. Fix: Remove user-scalable=no from <meta name=viewport>');
};

export {
  hasDocumentType, hasDocumentLanguage,
  hasDocumentTitle, hasDocumentMetaCharset, hasDocumentScalable
};
