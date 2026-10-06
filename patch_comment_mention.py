import os
import re

# 1. Update schema.prisma
schema_path = r"c:\mencari-online\prisma\schema.prisma"
with open(schema_path, "r", encoding="utf-8") as f:
    schema_content = f.read()

if "COMMENT_MENTION" not in schema_content:
    schema_content = schema_content.replace(
        "  COMMENT_REPLY",
        "  COMMENT_REPLY\n  COMMENT_MENTION"
    )
    with open(schema_path, "w", encoding="utf-8") as f:
        f.write(schema_content)
    print("Added COMMENT_MENTION to schema.prisma")


# 2. Update interactions.ts
interactions_path = r"c:\mencari-online\apps\web\src\app\actions\interactions.ts"
with open(interactions_path, "r", encoding="utf-8") as f:
    interactions_content = f.read()

mentions_code = """
    // Handle Mentions
    const mentionRegex = /@\\[.*?\\]\\(([^\\)]+)\\)/g;
    let match;
    const mentionedUserIds = new Set<string>();
    while ((match = mentionRegex.exec(content)) !== null) {
      const parts = match[1].split('/');
      const id = parts[1] || parts[0];
      if (id !== userId) {
        mentionedUserIds.add(id);
      }
    }

    if (mentionedUserIds.size > 0) {
      await Promise.all(
        Array.from(mentionedUserIds).map(mentionedId =>
          prisma.notification.create({
            data: {
              type: "COMMENT_MENTION" as any,
              userId: mentionedId,
              senderId: userId,
              postId: targetType === "post" ? targetId : undefined,
              projectId: targetType === "project" ? targetId : undefined,
              commentId: comment.id,
            }
          })
        )
      );
    }

    return { success: true, comment };
"""

if "Handle Mentions" not in interactions_content:
    interactions_content = interactions_content.replace(
        "    return { success: true, comment };",
        mentions_code
    )
    with open(interactions_path, "w", encoding="utf-8") as f:
        f.write(interactions_content)
    print("Added mentions extraction to interactions.ts")


# 3. Update en.json and id.json
id_json_path = r"c:\mencari-online\apps\web\messages\id.json"
en_json_path = r"c:\mencari-online\apps\web\messages\en.json"

with open(id_json_path, "r", encoding="utf-8") as f:
    id_json = f.read()
if "typeCommentMention" not in id_json:
    id_json = id_json.replace(
        '"typePostTag": "menandai Anda di sebuah postingan",',
        '"typePostTag": "menandai Anda di sebuah postingan",\n    "typeCommentMention": "menyebut Anda dalam sebuah komentar",'
    )
    with open(id_json_path, "w", encoding="utf-8") as f:
        f.write(id_json)
    print("Added typeCommentMention to id.json")

with open(en_json_path, "r", encoding="utf-8") as f:
    en_json = f.read()
if "typeCommentMention" not in en_json:
    en_json = en_json.replace(
        '"typePostTag": "tagged you in a post",',
        '"typePostTag": "tagged you in a post",\n    "typeCommentMention": "mentioned you in a comment",'
    )
    with open(en_json_path, "w", encoding="utf-8") as f:
        f.write(en_json)
    print("Added typeCommentMention to en.json")


# 4. Update Navbar.tsx
navbar_path = r"c:\mencari-online\apps\web\src\components\Navbar.tsx"
with open(navbar_path, "r", encoding="utf-8") as f:
    navbar_content = f.read()

# Add COMMENT_MENTION to color logic
color_logic_old = """                        notif.type === "POST_TAG" ? "bg-purple-500" :"""
color_logic_new = """                        notif.type === "POST_TAG" || notif.type === "COMMENT_MENTION" ? "bg-purple-500" :"""
if color_logic_old in navbar_content:
    navbar_content = navbar_content.replace(color_logic_old, color_logic_new)
    print("Updated color logic in Navbar.tsx")

# Add COMMENT_MENTION to icon logic
icon_logic_old = """                        {notif.type === "POST_TAG" && ("""
icon_logic_new = """                        {(notif.type === "POST_TAG" || notif.type === "COMMENT_MENTION") && ("""
if icon_logic_old in navbar_content:
    navbar_content = navbar_content.replace(icon_logic_old, icon_logic_new)
    print("Updated icon logic in Navbar.tsx")

# Add COMMENT_MENTION to text translation
text_logic_old = """                        {notif.type === "POST_TAG" && ` ${t("notif.typePostTag")}`}"""
text_logic_new = """                        {notif.type === "POST_TAG" && ` ${t("notif.typePostTag")}`}
                        {notif.type === "COMMENT_MENTION" && ` ${t("notif.typeCommentMention")}`}"""
if text_logic_old in navbar_content:
    navbar_content = navbar_content.replace(text_logic_old, text_logic_new)
    print("Updated text logic in Navbar.tsx")

with open(navbar_path, "w", encoding="utf-8") as f:
    f.write(navbar_content)
