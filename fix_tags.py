import re
with open('apps/web/src/app/actions/interactions.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('import { revalidateTag } from "next/cache";', 'import { updateTag } from "next/cache";')
c = c.replace('revalidateTag(', 'updateTag(')

with open('apps/web/src/app/actions/interactions.ts', 'w', encoding='utf-8') as f:
    f.write(c)
