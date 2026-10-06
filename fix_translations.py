import re

# Update id.json
id_json_path = r"c:\mencari-online\apps\web\messages\id.json"
with open(id_json_path, "r", encoding="utf-8") as f:
    id_json = f.read()

id_target = '"typePostTag": "telah menandai Anda dalam postingan. Klik untuk melihat.",'
id_replacement = '"typePostTag": "telah menandai Anda dalam postingan. Klik untuk melihat.",\n    "typeCommentMention": "menyebut Anda dalam sebuah komentar",'
if id_target in id_json and '"typeCommentMention"' not in id_json:
    id_json = id_json.replace(id_target, id_replacement)
    with open(id_json_path, "w", encoding="utf-8") as f:
        f.write(id_json)
    print("Added typeCommentMention to id.json")

# Update en.json
en_json_path = r"c:\mencari-online\apps\web\messages\en.json"
with open(en_json_path, "r", encoding="utf-8") as f:
    en_json = f.read()

en_target = '"typePostTag": "tagged you in a post. Click to view.",'
en_replacement = '"typePostTag": "tagged you in a post. Click to view.",\n    "typeCommentMention": "mentioned you in a comment",'
if en_target in en_json and '"typeCommentMention"' not in en_json:
    en_json = en_json.replace(en_target, en_replacement)
    with open(en_json_path, "w", encoding="utf-8") as f:
        f.write(en_json)
    print("Added typeCommentMention to en.json")
