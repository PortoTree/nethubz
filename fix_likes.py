import re
with open('apps/web/src/app/actions/interactions.ts', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(r'where: \{ id: existingLike\.id \},\n\s*\}\);\n\s*return \{ success: true, action: \"unliked\" \};', 'where: { id: existingLike.id },\n        });\n        if (targetType === \"project\") {\n          revalidateTag(`project_${targetId}`);\n          revalidateTag(\"global_projects\");\n        } else if (targetType === \"post\") {\n          revalidateTag(`post_${targetId}`);\n        }\n        return { success: true, action: \"unliked\" };', c)

c = re.sub(r'data: \{ type: reactionType \},\n\s*\}\);\n[ \t]*//[^\n]*\n[ \t]*//[^\n]*\n\s*return \{ success: true, action: \"updated\" \};', 'data: { type: reactionType },\n        });\n        if (targetType === \"project\") {\n          revalidateTag(`project_${targetId}`);\n          revalidateTag(\"global_projects\");\n        } else if (targetType === \"post\") {\n          revalidateTag(`post_${targetId}`);\n        }\n        return { success: true, action: \"updated\" };', c)

c = re.sub(r'      return \{ success: true, action: \"liked\" \};\n    \}', '      if (targetType === \"project\") {\n        revalidateTag(`project_${targetId}`);\n        revalidateTag(\"global_projects\");\n      } else if (targetType === \"post\") {\n        revalidateTag(`post_${targetId}`);\n      }\n      return { success: true, action: \"liked\" };\n    }', c)

with open('apps/web/src/app/actions/interactions.ts', 'w', encoding='utf-8') as f:
    f.write(c)
