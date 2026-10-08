const fs = require('fs');
let lines = fs.readFileSync('apps/web/src/components/ProjectCard.tsx', 'utf8').split('\n');

// We need to remove the first occurrence of old action buttons (from line 192 to 206 roughly).
// Let's just find the first {/* Action Buttons: Like, Comment, Share */}
const firstIndex = lines.findIndex(l => l.includes('{/* Action Buttons: Like, Comment, Share */}'));
const secondIndex = lines.findIndex((l, i) => i > firstIndex && l.includes('{/* Action Buttons: Like, Comment, Share */}'));

if (firstIndex !== -1 && secondIndex !== -1) {
  // We have a duplicate. Remove from firstIndex up to the line right before secondIndex, but keep the <p> and techStack?
  // Actually, lines 184-191 have description and techStack. Lines 192-206 are the OLD action buttons.
  // Lines 207-208 are `</div> </div>`.
  // Wait, let's see where the description and techstack are repeated.
  // Line 184: description.
  // Line 254: description.
  // So the ENTIRE block from 184 to 253 was duplicated!
  // My node script did: c.substring(0, actionButtonsStart) + newContent + c.substring(actionButtonsEnd);
  // It completely messed up the indices!

  // Let's just fetch the original file and do it right. Or rather, let's reset the file using git checkout, then apply the patch properly.
}
