// ==UserScript==
// @name         rn-scoring-helper
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Sets focus on the 'pattern1' (`Quick Find:`) field on RegattaNetwork's score edit page when it becomes available or a boat is moved.
// @author       Paul Leonard vibin w Gemini
// @match        https://www.regattanetwork.com/clubmgmt/mgmt_score_edit_beta.php?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here

    // --- Configuration ---
    // The name of the input field to focus on.
    const targetFieldName = 'pattern1';
    // The CSS selector for the target field.
    const targetFieldSelector = `input[name="${targetFieldName}"]`;

    // --- Script Logic ---

    /**
     * Attempts to set focus on the target field.
     * Logs a message to the console indicating success or failure.
     */
    function attemptFocus() {
        const inputField = document.querySelector(targetFieldSelector);

        if (inputField) {
            // Check if the element is visible and not disabled before trying to focus.
            // This can prevent issues if the field is temporarily hidden or inactive.
            if (inputField.offsetParent !== null && !inputField.disabled) {
                // Using setTimeout with 0ms ensures this runs after the current
                // browser rendering cycle, which can sometimes help with focus issues
                // especially after dynamic DOM manipulations.
                setTimeout(() => {
                    inputField.focus();
                    console.log(`Focus set on element with name: ${targetFieldName}`);
                }, 0);
                return true; // Indicate that focus was successfully attempted
            } else {
                console.log(`Element with name "${targetFieldName}" found but not visible or is disabled.`);
            }
        } else {
            console.log(`Element with name "${targetFieldName}" not yet found.`);
        }
        return false; // Indicate that focus was not set
    }

    // --- Initial Focus Attempt (on page load) ---
    // Try to set focus as soon as the DOM is ready.
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired. Attempting initial focus...');
        attemptFocus();
    });

    // --- Dynamic Focus with MutationObserver ---
    // This observer will watch for changes in the DOM, which is crucial for
    // detecting when a new boat has been moved or the relevant part of the page updates.
    const observer = new MutationObserver((mutationsList, observer) => {
        // Iterate over all detected mutations
        for (const mutation of mutationsList) {
            // Check if nodes were added or attributes changed (e.g., visibility)
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // Attempt to set focus. If successful, we can disconnect the observer
                // if we only need to focus once per dynamic change.
                // If the page re-renders the field multiple times, keep the observer connected.
                console.log('DOM changed. Re-attempting focus...');
                if (attemptFocus()) {
                    // If you only want to focus once after the field appears or is manipulated,
                    // you can disconnect the observer here:
                    // observer.disconnect();
                    // console.log('Observer disconnected after successful focus.');
                }
                // For RegattaNetwork, it's likely the field might be re-enabled/re-rendered
                // multiple times as you move between boats, so keeping the observer active
                // might be beneficial.
            }
        }
    });

    // Start observing the document body for changes.
    // 'childList': observe direct children additions/removals.
    // 'subtree': observe changes in the entire subtree of the body.
    // 'attributes': observe changes to attributes (like 'style' or 'disabled').
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    console.log('Tampermonkey script initialized and observing DOM changes.');

})();