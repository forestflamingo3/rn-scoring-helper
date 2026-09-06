# README

## Short Description

This script improves the scoring data entry experience in Regatta Network, mainly by enabling a  heads-down "ten-key" style of data entry. Usability improvements to assigning penalty codes are also introduced.

## Long Description

Use this script when doing Regatta Network (RN) scoring data entry - you know: click in the `Quick Find` field, key a `sail #`, hit Enter, key `finish time`, hit Enter, **REPEAT**.

Normally, you have to look away from the work, and hope the mouse doesn't jiggle much when you grab it, and move it back anyway, and then get your right hand back to the numpad for keying in sail numbers and finish times and then look back at the work... It's nuts.

This script ELIMINATES the need to click in the g--d--- `Quick Find` field in between boats. How? By setting the Focus on the DOM `Pattern1` Field, the first `Quick Find` on the page.

You get to keep your hands on the keyboard, where they belong.

The penalty codes pulldown control is presented in sorted order, and you can disable codes that you don't want to be able to choose.

Penalty codes defaults can be modified by activating RRS A5.3 support, and can be tailored on a per-code basis. 

A bug in RN penalty code defaults where it always used the previous penalty rather than whatever was correct for the code is fixed as a side effect.

# Table of Contents
- [[#Security|Security]]
- [[#Usage|Usage]]
	- [[#Usage#Enable TamperMoneky|Enable TamperMoneky]]
	- [[#Usage#Enable this script|Enable this script]]
- [[#Features|Features]]
	- [[#Features#Feature List|Feature List]]
	- [[#Features#Usability improvements|Usability improvements]]
	- [[#Features#Improved focus setting during scoring and corrections|Improved focus setting during scoring and corrections]]
	- [[#Features#Onscreen control to toggle focus setting|Onscreen control to toggle focus setting]]
	- [[#Features#Per-code penalty basis defaults|Per-code penalty basis defaults]]
	- [[#Features#Penalty code filter|Penalty code filter]]
- [[#Install|Install]]
	- [[#Install#References|References]]
	- [[#Install#Dependencies|Dependencies]]
	- [[#Install#Procedure|Procedure]]
- [[#Maintainer|Maintainer]]
- [[#License|License]]
- [[#History|History]]


## Security

The magic uses the Chrome extension TamperMonkey. That extension can read and rewrite the contents of any page in the browser.

I vibecoded this with Gemini and the most recent versions use ChatGPT. It's been visually reviewed, and validated with non-exhaustive testing.

Execution of scripts is controlled and restricted to defined URLs. This solution's scripting is constrained to just the scoring data entry page.

**If you don't trust TamperMonkey or your script developer(s) then stop now.**

## Usage

### Enable TamperMoneky

- open the TamperMonkey console (click the extension),
- ensure the Enabled option is green-checked.
- leave the extension enabled or not when done scoring, depending on other usages and your preference

### Enable this script

- click the Dashboard, a new browswer tab will open,
- ensure the slide switch for THIS script is green-enabled.
- close the tab
- it will execute ONLY for the specific page
- RN scoring URL `https://www.regattanetwork.com/clubmgmt/mgmt_score_edit_beta.php?*`

- (Optional) Edit the script's tailorable options
	- These all default to sensible things
	- Use Autofocus and use A5.3 per-code scoring are on-screen toggles also 
	- Use Autofocus  by default is TRUE
	- Use A5.3 setup: default is FALSE and per-code scoring if not
	- Penalty menu options to disable, BYE, RET-BF, and RET-AF are the defaults.
	- The penalty menu is always sorted now
	
- On the RN screen
  - hit shift-f5 to hard refresh the screen.
  - this forces a reload of the page, injecting it with the script.
  - if the script has been enabled all along, then it should have already been injected.

- Commence data entry.
  - observe the lack of need to click the mouse between entries.
  - observe the other enhancements in blue

- Rejoice!

## Features

### Feature List
- Sets focus to Quick Find, so mouse click not needed, TRUE by default.
- Sorts the penalty codes pulldown list
- Allows disabling of penalty codes in the pulldown to prevent use
- Option to use A5.3 penalty point defaults, FALSE by default. 
- Feature details below
### Usability improvements

Versions 0.8 and 0.9 added usability improvements:
- inline (on-screen) checkbox to control moving focus to Quick Find
- more targeted focus control; only when actually adding or removing scored boats
- when un-scoring, the focus won't get snatched back, so you should be able to correct errors in-line more easily
- script code-based configuration options are grouped and documented at the top of source
- script interventions on the page are in light blue, for visibility

### Improved focus setting during scoring and corrections

Version 0.7 returns focus to Quick Find after a boat moves from the unscored list into a scored list, rather than always grabbing focus aggressively.

- Moving boats back, reordering scores, editing penalty fields, and switching A5.3 do not trigger focus. 
- On initial load, Quick Find receives focus only if another control does not already have it.
- Detection compares scored and unscored boat counts after page updates, excluding placeholder options. It relies on RN completing the transfer in the same update, as in the supplied page. 
- Deliberate interaction cancels a pending focus return.

### Onscreen control to toggle focus setting

- Uncheck **Auto-focus Quick Find** underneath Quick Find for extended corrections. 
- Check it again to resume heads-down scoring. 
- Changing the switch does not itself move focus. 
- The setting survives menu rebuilding and resets on page reload 
- Edit `autoFocusQuickFind` near the top of the script to change its startup value.

### Per-code penalty basis defaults

Version 0.6 resets **Penalty Basis** whenever you select a penalty code, instead of
carrying over the previous entry's basis (which is a bug), and adds explicit support for A5.3 scoring for setting penalty point defaults.

- By default, all count-based codes use **Competitors +1**. 
- You can now manually change the basis for that entry; page refreshes of the menu do not overwrite your choice. 
- Selecting another code applies that code's default. 
- Existing selections are preserved when the script loads. 

The **Use A5.3 defaults** checkbox beside the penalty menu switches the preset (see below)
on or off. 
- Toggling it immediately resets the current code's basis, including any manual basis choice.
- Configured per-code overrides still win. 
- The checkbox starts **off** and resets on page reload, so look at it after a save
- edit `useAppendixA53` to change its startup setting. 
- The current switch state survives dynamic replacement of the menu.

Configure these settings near the top of the script:

```javascript
let useAppendixA53 = false;
const penaltyBasisOverrides = {
    DNF: 'F1', // Example: Finishers +1
    DNS: 'C1', // Example: Checkins +1
    DNC: '',   // Competitors +1
};
```

Set `useAppendixA53 = true` for this preset:

| Codes | Default |
| --- | --- |
| DNC | Competitors +1 |
| DNS, OCS, UFD, BFD, BFD-DNE, NSC, DNF, RET, RET-BF, RET-AF, DSQ, DNE, DGM | Checkins +1 |
- Per-code overrides take precedence over the preset. 
- DGM and RN's extended retirement/disqualification codes are treated as retirement/disqualification entries for this mapping.
- The preset sets entry defaults only, does not enable a server-side rule or recalculate existing scores, and does not change percentage, points, time, or redress inputs.

The shipped override object is empty. Supported values are 
- `''` (Competitors +1),
- `F1`, `F2`, `F3` (Finishers +1/+2/+3), and 
- `C1`, `C2` (Checkins +1/+2).
- Invalid overrides are ignored with a console warning.

### Penalty code filter

Version 0.5 
- sorts the **Add Penalty/Comment** menu alphabetically by the actual
code (for example, `CP` for Custom Penalty), with `NONE` always first, and 
- adds the ability to disable undesired codes to aid in consistency of scoring.

**To configure the filter,** edit this line near the top of `scripts/rn-scoring-helper`
in the Tampermonkey editor:

```javascript
const disabledPenaltyCodes = ['BYE', 'RET-BF', 'RET-AF'];
```

- Use exact codes, including hyphens. Set the list to `[]` to enable all codes.
- Save the script and reload the scoring page AFTER saving any scores in progress.
- A filtered code stays visible but greyed out and unavailable for selection. If it is already selected, including through a programmatic assignment, the helper keeps it enabled to preserve its value. After another code is selected, it becomes disabled again. Options disabled by RN itself remain disabled.
- Unknown codes are ignored, and the helper never disables `NONE`. 
- The menu uses subtle blue styling to identify the helper's enhancement.
- Original values and labels remain available to Regatta Network.
- Sorting and filtering are reapplied if the page rebuilds the menu, without triggering its penalty-change handler.
## Install

### References

- Regatta Network - <https://regattanetwork.com>
- TamperMonkey project - <https://www.tampermonkey.net/>
- This project https://www.github.com/forestflamingo3/rn-scoring-helper

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
## Maintainer

- Paul Leonard <paul.e.leonard@gmail.com>
- This project is maintained primarily for my own use and for the DIYC race committee. Bug reports are welcome, but I am not currently accepting code contributions.

## License

UNLICENSED.

---

## History

Use this instead of CHANGELOG until more than 3-5 changes, depending on complexity.

2026-09-06

- Version 0.9: blue penalty menu styling; configured codes are visible but
  disabled instead of hidden. Rename the setting to `disabledPenaltyCodes`.

2026-09-06

- Version 0.8: move the focus switch underneath Quick Find, give helper controls  a subtle blue treatment, and group user settings separately from internal code.

2026-09-06

- Version 0.7: focus only after scoring a boat; add Auto-focus Quick Find switch  for corrections and remove focus grabs from unrelated page changes.

2026-09-06

- Version 0.6: per-code Penalty Basis defaults, optional A5.3 preset, and
  per-code overrides. Clear stale bases when selecting codes without a basis.

2026-09-05

- Version 0.5: sort penalty codes with NONE first; add a configurable filter,  initially hiding BYE, RET-BF, and RET-AF while keeping the selected code visible.

2026-07-10

- First doc pass

2026-07-12

- Chore release 0.4 formally. This validates what's on the Club computer. No changes to code.

2026-07-17

- Polish README
- Publish public repo
