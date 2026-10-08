const fs = require('fs');
let c = fs.readFileSync('apps/web/src/components/ProjectCard.tsx', 'utf8');
c = c.replace('import { MediaRenderer } from "./MediaRenderer";', 'import { MediaRenderer } from "./MediaRenderer";\nimport { ReactionButton, ReactionType } from "./ReactionButton";\nimport ProjectReactionListDropdown from "./ProjectReactionListDropdown";\nimport { checkInteractionState, toggleLike } from "@/app/actions/interactions";\nimport { useAuth } from "@/context/AuthContext";');
c = c.replace('import React, { useState } from "react";', 'import React, { useState, useEffect, useCallback } from "react";');
fs.writeFileSync('apps/web/src/components/ProjectCard.tsx', c);
