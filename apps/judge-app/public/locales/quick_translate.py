#!/usr/bin/env python3
import json
from pathlib import Path

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Read English (source)
en_data = load_json('en/translation.json')

# For each language, merge in missing keys from EN
for lang in ['fr', 'de', 'vi', 'cn']:
    lang_path = Path(lang) / 'translation.json'
    if lang_path.exists():
        lang_data = load_json(lang_path)
        
        # Simple merge: for missing keys, use English values
        def merge_missing(en, lang):
            for key, value in en.items():
                if key not in lang:
                    lang[key] = value
                elif isinstance(value, dict) and isinstance(lang.get(key), dict):
                    merge_missing(value, lang[key])
        
        merge_missing(en_data, lang_data)
        save_json(lang_path, lang_data)
        print(f'✓ Updated {lang}')

print('\n✨ Done!')
