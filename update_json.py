import json

files = {
    r"c:\nethubz\apps\web\messages\id.json": "Lihat Giveaway",
    r"c:\nethubz\apps\web\messages\en.json": "View Giveaway"
}

for path, translation in files.items():
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if "giveaway" not in data:
            data["giveaway"] = {}
            
        data["giveaway"]["viewGiveaway"] = translation
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"Updated {path}")
    except Exception as e:
        print(f"Error on {path}: {e}")
