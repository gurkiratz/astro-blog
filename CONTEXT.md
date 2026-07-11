# Personal Site

This context describes the visitor-facing concepts that shape the site shell.

## Language

**Theme**:
A persisted visual selection comprising a color scheme, palette, and optional background media.
_Avoid_: Skin, appearance preset

**Site Header**:
The opening section containing site identity, primary navigation, and theme selection.
_Avoid_: Top bar

**Site Footer**:
The persistent closing section containing local time, latest-update information, social links, and the footer doodle.
_Avoid_: Bottom bar

## Relationships

- A visitor selects exactly one **Theme**
- The **Site Header** provides the visitor's **Theme** selection
- The **Site Footer** uses the active **Theme** but does not control it

## Example dialogue

> **Dev:** "Should changing the **Theme** restart the clock in the **Site Footer**?"
> **Domain expert:** "No—the footer follows the theme visually, but its local-time behavior is independent."

## Flagged ambiguities

- None.
