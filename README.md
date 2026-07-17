# Regatta Network Scoring Helper script

## Short Description

This script allows heads-down scoring data entry in Regatta Network, like using a "ten-key" style of data entry.

## Long Description

Use this script when doing Regatta Network (RN) scoring data entry - you know: click in the `Quick Find` field, key a `sail #`, hit Enter, key `finish time`, hit Enter, **REPEAT**.

Normally, you have to look away from the work, and hope the mouse doesn't jiggle much when you grab it, and move it back anyway, and then get your right hand back to the numpad for keying in sail numbers and finish times and then look back at the work... It's nuts.

This script ELIMINATES the need to click in the g--d--- `Quick Find` field in between boats. How? By setting the Focus on the DOM `Pattern1` Field, the first (OK, only) `Quick Find` on the page.

You get to keep your hands on the keyboard, where they belong.

## Table of Contents

- [Regatta Network Scoring Helper script](#regatta-network-scoring-helper-script)
  - [Short Description](#short-description)
  - [Long Description](#long-description)
  - [Table of Contents](#table-of-contents)
  - [Security](#security)
  - [Install](#install)
    - [References](#references)
    - [Dependencies](#dependencies)
    - [Procedure](#procedure)
  - [Usage](#usage)
    - [Common tasks](#common-tasks)
      - [Enable TamperMoneky](#enable-tampermoneky)
      - [Enable this script](#enable-this-script)
    - [Routine usage](#routine-usage)
    - [Side effects during scoring cleanup](#side-effects-during-scoring-cleanup)
  - [Maintainer](#maintainer)
  - [License](#license)
  - [History](#history)

## Security

This script uses the Chrome extension TamperMonkey. That extension can read and rewrite the contents of any page in the browser.

I vibecoded this with Gemini. It's been visually reviewed, and validated with non-exhaustive testing.

Execution of scripts is controlled and restricted to defined URLs. This solution's scripting is constrained to just the scoring data entry page.

**If you don't trust TamperMonkey or your script developer(s) then stop now.**

## Install

### References

- Regatta Network - <https://regattanetwork.com>
- TamperMonkey project - <https://www.tampermonkey.net/>

### Dependencies

- TamperMonkey browser extension - <https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en>

### Procedure

- Create a new script in TamperMonkey's storage
  - Make sure TamperMonkey is enabled
  - Open the TamperMonkey console, then click on Dashboard, a new browser tab will open, this is where scripts are maintained
  - click the `+` tab, a new script editor window will appear within the current browser tab
  - copy/paste the contents of `rn-scoring-helper` into the editor window
  - change the name of the script from `<New userscript>` to `rn-scoring-helper`.
  - click `File > Save`, the script is saved to TamperMonkey's browser storage.

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
- RN scoring URL `https://www.regattanetwork.com/clubmgmt/mgmt_score_edit_beta.php?*`

### Routine usage

- Make sure TamperMonkey is enabled
  - leave the extension enabled or not when done scoring, depending on other usages and your preference

- Make sure the script itself also is enabled
  - leave this script enabled or not when done scoring, depending preference

- Back on the RN screen:
  - hit shift-f5.
  - this forces a reload of the page, injecting it with the script.
  - if the script has been enabled all along, then it should have already been injected.

- Commence data entry.
  - observe the lack of need to click the mouse between entries.

- Rejoice!

### Side effects during scoring cleanup

- because this script keeps dragging the insertion point to `Quick Find:`, working with boats that have already been scored & need editing can be problematic.
- often, just triple-clicking in the section on the right side of the screen will let the cursor come over, but it can be unreliable behavior.
- the best practice is to disable the script while you need random access to the scoing input screen.
- DO A SAVE SCORES then do a full page reload after disabling the script.

## Maintainer

- Paul Leonard <paul.e.leonard@gmail.com>

## License

UNLICENSED.

---

## History

Use this instead of CHANGELOG until more than 3-5 changes, depending on complexity.

2026-07-10

- First doc pass

2026-07-12

- Chore release 0.4 formally. This validates what's on the Club computer. No changes to code.
