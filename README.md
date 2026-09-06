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
    - [Per-code penalty basis defaults](#per-code-penalty-basis-defaults)
    - [Penalty code filter](#penalty-code-filter)
    - [Common tasks](#common-tasks)
      - [Enable TamperMoneky](#enable-tampermoneky)
      - [Enable this script](#enable-this-script)
    - [Routine usage](#routine-usage)
    - [Focus during scoring and corrections](#focus-during-scoring-and-corrections)
  - [Maintainer](#maintainer)
  - [License](#license)
  - [History](#history)

## Security

The magic uses the Chrome extension TamperMonkey. That extension can read and rewrite the contents of any page in the browser.

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

### Per-code penalty basis defaults

Version 0.6 resets Penalty Basis whenever you select a penalty code, instead of
carrying over the previous entry's basis. By default, all count-based codes use
**Competitors +1**. You can then manually change the basis for that entry; page
refreshes of the menu do not overwrite your choice. Selecting another code
applies that code's default. NONE and codes with other inputs clear the hidden basis.
Existing selections are preserved when the script loads. Programmatic changes
must dispatch a bubbling `change` event to request a new default.

The **Use A5.3 defaults** checkbox beside the penalty menu switches the preset
on or off. Toggling it immediately resets the current code's basis, including
any manual basis choice. Configured per-code overrides still win. The checkbox
starts off and resets on page reload; edit `useAppendixA53` to change its startup
setting. The current switch state survives dynamic replacement of the menu.

Configure these settings near the top of the script:

```javascript
let useAppendixA53 = false;
const penaltyBasisOverrides = {
    DNF: 'F1', // Example: Finishers +1
    DNS: 'C1', // Example: Checkins +1
    DNC: '',   // Competitors +1
};
```

The shipped override object is empty. Supported values are `''` (Competitors +1),
`F1`, `F2`, `F3` (Finishers +1/+2/+3), and `C1`, `C2` (Checkins +1/+2).
Invalid overrides are ignored with a console warning.

Set `useAppendixA53 = true` for this preset:

| Codes | Default |
| --- | --- |
| DNC | Competitors +1 |
| DNS, OCS, UFD, BFD, BFD-DNE, NSC, DNF, RET, RET-BF, RET-AF, DSQ, DNE, DGM | Checkins +1 |

Per-code overrides take precedence over the preset. DGM and RN's extended
retirement/disqualification codes are treated as retirement/disqualification
entries for this mapping.

[RRS A5.3](https://media.sailing.org/sailing/wp-content/uploads/2025/07/29083752/2025-2028-RRS-with-Changes-and-Corrections.pdf)
applies only when invoked by the notice of race or sailing instructions. It uses
boats that came to the starting area, with DNC based on series entries. This
preset assumes RN's Checkins and Competitors counts represent those populations;
the saved page does not establish how the server calculates those counts.
It sets entry defaults only, does not enable a server-side rule or recalculate
existing scores, and does not change percentage, points, time, or redress inputs.

### Penalty code filter

Version 0.5 sorts the **Add Penalty/Comment** menu alphabetically by the actual
code (for example, `CP` for Custom Penalty), with `NONE` always first.

To configure the filter, edit this line near the top of `scripts/rn-scoring-helper`
in the Tampermonkey editor:

```javascript
const hiddenPenaltyCodes = ['BYE', 'RET-BF', 'RET-AF'];
```

Use exact codes, including hyphens. Set the list to `[]` to show all codes.
Unknown codes are ignored, and `NONE` cannot be hidden. Save the script and reload
the scoring page after saving any scores in progress.

A filtered code remains visible whenever it is selected, including when the page
sets it programmatically. After another code is selected, it is hidden again.
The filter only hides menu choices; their original values and labels remain
available to Regatta Network. Sorting and filtering are reapplied if the page
rebuilds the menu, without triggering its penalty-change handler.

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

### Focus during scoring and corrections

Version 0.7 returns focus to Quick Find after a boat moves from the unscored list
into a scored list. Moving boats back, reordering scores, editing penalty fields,
and switching A5.3 do not trigger focus. On initial load, Quick Find receives
focus only if another control does not already have it.

Uncheck **Auto-focus Quick Find** beside the A5.3 switch for extended corrections.
Check it again to resume heads-down scoring. Changing the switch does not itself
move focus. The setting survives menu rebuilding and resets on page reload;
edit `autoFocusQuickFind` near the top of the script to change its startup value.

Detection compares scored and unscored boat counts after page updates, excluding
placeholder options. It relies on RN completing the transfer in the same update,
as in the supplied page. Deliberate interaction cancels a pending focus return.

## Maintainer

- Paul Leonard <paul.e.leonard@gmail.com>
- This project is maintained primarily for my own use and for the DIYC race committee. Bug reports are welcome, but I am not currently accepting code contributions.

## License

UNLICENSED.

---

## History

Use this instead of CHANGELOG until more than 3-5 changes, depending on complexity.

2026-09-06

- Version 0.7: focus only after scoring a boat; add Auto-focus Quick Find switch
  for corrections and remove focus grabs from unrelated page changes.

2026-09-06

- Version 0.6: per-code Penalty Basis defaults, optional A5.3 preset, and
  per-code overrides. Clear stale bases when selecting codes without a basis.

2026-09-05

- Version 0.5: sort penalty codes with NONE first; add a configurable filter,
  initially hiding BYE, RET-BF, and RET-AF while keeping the selected code visible.

2026-07-10

- First doc pass

2026-07-12

- Chore release 0.4 formally. This validates what's on the Club computer. No changes to code.

2026-07-17

- Polish README
- Publish public repo
