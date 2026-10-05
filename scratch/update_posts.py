import re

with open("c:\\mencari-online\\apps\\web\\src\\app\\actions\\posts.ts", "r") as f:
    content = f.read()

# Replace all occurrences of
# _count: { select: { likes: true, comments: true } }
# with
# _count: { select: { likes: true, comments: true } }, project: true

content = content.replace("_count: {\n          select: { likes: true, comments: true }\n        }", "_count: {\n          select: { likes: true, comments: true }\n        },\n        project: true")

with open("c:\\mencari-online\\apps\\web\\src\\app\\actions\\posts.ts", "w") as f:
    f.write(content)
