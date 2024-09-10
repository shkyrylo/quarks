// ==UserScript==
// @name         About Me Translator
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Translate users' about me on moderation page
// @author       Kyrylo Shykunov
// @match        https://admin.ddkit.io/about-me-moderation
// @match        https://admin.ddkit.dev/about-me-moderation
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const SOURCE_LANG = 'auto';
const TARGET_LANG = 'uk';

(function () {
    'use strict';

    // Function to process Google Translate response and merge translated sentences
    function processTranslationResponse(responseText) {
        const response = JSON.parse(responseText);
        let translatedText = "";

        // Iterate through the response to extract the translated sentences
        response[0].forEach((sentenceArray) => {
            translatedText += sentenceArray[0]; // The translated sentence is the first item in each sub-array
        });

        return translatedText;
    }

    // Function to translate text using Google Translate API
    function translateText(text, callback) {
        const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${TARGET_LANG}&dt=t&q=${encodeURIComponent(text)}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: translateUrl,
            onload: function (response) {
                try {
                    const translatedText = processTranslationResponse(response.responseText);
                    callback(translatedText);
                } catch (e) {
                    console.error('Translation failed:', e);
                }
            },
            onerror: function () {
                console.error('Translation request failed.');
            }
        });
    }

    // Function to translate the content of specific divs and append the translation
    function translateUsersAboutMe() {
        const divs = document.querySelectorAll('[class^="AboutMeCard_aboutMe__"]');

        divs.forEach((div) => {
            const originalText = div.innerText.trim();

            // Translate the text
            translateText(originalText, (translatedText) => {
                // Create a new div with the translated text
                const translatedDiv = document.createElement('div');
                translatedDiv.className = div.className; // Apply the same class for styling consistency
                translatedDiv.style.marginTop = '10px'; // Add some space between original and translated

                // Add translated text to the new div
                translatedDiv.innerText = translatedText;

                // Append the translated text below the original div
                div.parentNode.insertBefore(translatedDiv, div.nextSibling);
            });
        });
    }

    // Fallback: If elements are already present, run the translation after 5 seconds
    setTimeout(translateUsersAboutMe, 5000);
})();
