# Task: Update Score Popup Position to Mouse Click Location

## Description
Currently, the +1 score popup appears at the center of the cat when clicked. This task updates the popup to appear at the exact mouse click location for more precise visual feedback.

## Technical Details
- File to modify: `/src/scripts/cats.js`
- Method to update: `createScorePopup`
- Pass mouse event coordinates from click handler to popup creation

## Implementation Plan
1. Modify `setupCatClickHandler` to pass mouse event to `animateClick`
2. Update `animateClick` to pass mouse coordinates to `createScorePopup`
3. Modify `createScorePopup` to use mouse coordinates instead of cat element position

## Acceptance Criteria
- [x] Score popup appears exactly at mouse click position
- [x] Existing animation (floating up and fading) remains unchanged
- [x] Works with the pixel-perfect click detection system

## Learning Notes
- Using mouse event coordinates for precise UI feedback
- Maintaining separation of concerns between click handling and visual feedback
- Pixel-perfect interaction considerations

## Testing
1. Click different areas of the cat statue
2. Verify popup appears at click location
3. Test with different mouse positions within hitbox
4. Ensure animation remains smooth
