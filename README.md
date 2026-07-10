# README.md - Regatta Network Scoring Helper script

## Table of Contents

- [README.md - Regatta Network Scoring Helper script](#readmemd---regatta-network-scoring-helper-script)
  - [Table of Contents](#table-of-contents)
  - [Short Description](#short-description)
  - [Security](#security)
  - [Install](#install)
  - [Usage](#usage)
    - [Common tasks](#common-tasks)
      - [Enable TamperMoneky](#enable-tampermoneky)
      - [Enable this script](#enable-this-script)
    - [Routine usage](#routine-usage)
    - [Side effects during cleanup](#side-effects-during-cleanup)
  - [Maintainer](#maintainer)
  - [License](#license)
  - [History](#history)

## Short Description

Provide for heads-down scoring data entry, like using a "ten-key". This script ELIMINATES the need to click in the gd `Quick Find:` field in between boats.

Do this by setting the Focus on the `Pattern1` Field, the first (OK, only) `Quick Find` on the page.

## Security

This script requires the Chrome extension TamperMonkey. That extension can read and rewrite the contents of any page in the browser.

Execution of scripts is controlled and restricted to defined URLs. This solution's scripting is constrained to just the scoring data entry page.

**If you don't trust TamperMonkey or your script developer(s) then stop now.**

## Install

- Create a new script in TamperMonkey's storage
  - Make sure TamperMonkey is enabled
  - Open the TamperMonkey console, then click on Dashboard, a new browser tab will open, this is where scripts are maintained
  - click the `+` tab, a new script editor window will appear within the current browser tab
  - copy/paste the contents of `rn-scoring-helper.js` into the editor window
  - change the name of the script from `<New userscript>` to `rn-scoring-helper`.
  - click `File > Save`, the script is saved to TamperMonkey's browser storage.

- `Dependencies`. TamperMoneky

## Usage

### Common tasks

#### Enable TamperMoneky
  - open the TamperMonkey console (click the extension), 
  - ensure the Enabled option is green-checked.

#### Enable this script
  - click the Dashboard, a new browswer tab will open, 
  - ensure the slide switch for THIS script is green-enabled. 
  - close the tab
  - it will execute ONLY for the specific page 
  - RN scoring URL ` https://www.regattanetwork.com/clubmgmt/mgmt_score_edit_beta.php?*`

### Routine usage

- Make sure TamperMoneky is enabled
  - leave TamperMonkey enabled or not when done scoring, depending on other usages and your preference

- Make sure the script itself also is enabled
  - leave this script enabled or not when done scoring, depending preference

- Back on the RN screen:
  - hit shift-f5. 
  - this forces a reload of the page, injecting it with the script. 
  - if the script has been enabled all along, then it should have already been injected.

- Commence data entry.
  - observe the lack of need to click the mouse between entries.

- Rejoice!

### Side effects during cleanup

- because it keeps dragging the insertion point to `Quick Find:`, working with boats that have already been scored & need editing can be problematic.
- often, just triple-clicking in the section on the right side of the screen will let the cursor come over, but it doesn't stay.
- the best practice is to disable the script while you need random access to the scoing input screen.

## Maintainer

- Paul Leonard paul.e.leonard@gmail.com

## License

UNLICENSED.

---

## History

Use this instead of CHANGELOG until more than 3-5 changes, depending on complexity.

2026-07-10

- First doc pass
