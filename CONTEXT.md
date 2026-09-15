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

**Canvas**:
The single shared drawing at `/canvas`. There is exactly one, and it is the same drawing for every visitor.
_Avoid_: Board, whiteboard, sketch

**Editor** (of the Canvas):
A visitor whose signed-in email appears on the canvas editor allowlist, and who may therefore change the **Canvas**. Everyone else is a viewer.
_Avoid_: Admin, owner, author

## Relationships

- A visitor selects exactly one **Theme**
- The **Site Header** provides the visitor's **Theme** selection
- The **Site Footer** uses the active **Theme** but does not control it
- Every visitor may read the **Canvas**; only an **Editor** may change it
- Being signed in does not make a visitor an **Editor** — the allowlist does
- The **Canvas** follows the active **Theme** but, unlike other pages, spans the full viewport width and shows no **Site Footer**

## Example dialogue

> **Dev:** "Should changing the **Theme** restart the clock in the **Site Footer**?"
> **Domain expert:** "No—the footer follows the theme visually, but its local-time behavior is independent."

> **Dev:** "A visitor signed in with a magic link. Are they an **Editor**?"
> **Domain expert:** "Not unless their email is on the allowlist. Anyone can sign in; that only tells us who they are, not that they may draw."

> **Dev:** "Where does the **Canvas** camera position live?"
> **Domain expert:** "With the visitor, not the drawing. Two people looking at the same **Canvas** are looking at their own corners of it."

## Flagged ambiguities

- None.
