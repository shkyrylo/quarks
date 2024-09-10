// ==UserScript==
// @name         About Me Translator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Translate users' about me on moderation page
// @author       Kyrylo Shykunov
// @match        *://*/about-me-moderation
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

        const detectedLang = response[2]; // Google Translate's detected language

        return { translatedText, detectedLang };
    }

    // Function to translate text using Google Translate API
    function translateText(text, callback) {
        const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${SOURCE_LANG}&tl=${TARGET_LANG}&dt=t&q=${encodeURIComponent(text)}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: translateUrl,
            onload: function (response) {
                try {
                    const { translatedText, detectedLang } = processTranslationResponse(response.responseText);

                    // Only call the callback if the source language is different from the target language
                    if (detectedLang !== TARGET_LANG) {
                        callback(translatedText);
                    }
                } catch (e) {
                    console.error('Translation failed:', e);
                }
            },
            onerror: function () {
                console.error('Translation request failed.');
            }
        });
    }

    // Function to check and translate text inside AboutMeCard_mainInfo__ divs
    function checkAndTranslate() {
        const mainInfoDivs = document.querySelectorAll('[class^="AboutMeCard_aboutMe__"]');

        mainInfoDivs.forEach((mainInfoDiv) => {
            // Get the p tag for source text
            const sourceTextElement = mainInfoDiv.querySelector('p');
            // Get the translation div
            const translationDiv = mainInfoDiv.querySelector('[class^="AboutMeCard_translate__"]');

            if (sourceTextElement && translationDiv && !translationDiv.innerText.trim()) {
                const sourceText = sourceTextElement.innerText.trim();

                // Ignore if sourceText is empty or has a length of 1
                if (sourceText.length > 1) {
                    // Translate the text and place it in the translation block
                    translateText(sourceText, (translatedText) => {
                        translationDiv.innerText = translatedText;
                        translationDiv.style.display = 'block'; // Ensure the translated div is visible
                    });
                }
            }
        });
    }

    // Continuously check for new elements every second and translate if needed
    setInterval(checkAndTranslate, 1000);
})();
