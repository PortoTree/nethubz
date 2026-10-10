import sys

path = r'c:\nethubz\apps\web\src\components\ReactionButton.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_react_text = '''        {!hideText && <span className="hidden sm:inline text-[#65676B] dark:text-[#B0B3B8] font-semibold">{t("feed.react") || "Reaksi"}</span>}'''
new_react_text = '''        {!hideText && <span className="text-[#65676B] dark:text-[#B0B3B8] font-semibold">{t("feed.react") || "Reaksi"}</span>}'''

content = content.replace(old_react_text, new_react_text)

with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
