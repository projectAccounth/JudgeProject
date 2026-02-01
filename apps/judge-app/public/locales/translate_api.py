import json
import os
from pathlib import Path
from deep_translator import GoogleTranslator  # pip install deep-translator

# Map your folder names to Google ISO codes
LANG_MAP = {
    'fr': 'fr',
    'de': 'de',
    'vi': 'vi',
    'cn': 'zh-CN' # Google uses zh-CN for simplified
}

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved {filepath}")

def flatten_dict(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def unflatten_dict(d, sep='.'):
    result = {}
    for key, value in d.items():
        parts = key.split(sep)
        current = result
        for part in parts[:-1]:
            current = current.setdefault(part, {})
        current[parts[-1]] = value
    return result

def process_language(lang_code, lang_full_name):
    print(f"\n{'='*40}\nProcessing {lang_full_name} ({lang_code})")
    
    lang_path = Path(lang_code) / 'translation.json'
    en_path = Path('en') / 'translation.json'
    
    if not en_path.exists():
        print(f"❌ Source file missing: {en_path}")
        return False
    
    # Load and Flatten
    en_flat = flatten_dict(load_json(en_path))
    # If target doesn't exist, start with empty dict
    lang_flat = flatten_dict(load_json(lang_path)) if lang_path.exists() else {}

    # Logic: Only translate if key is missing OR value equals the English version
    to_translate = {k: v for k, v in en_flat.items() if k not in lang_flat or lang_flat[k] == v}
    
    if not to_translate:
        print(f"✓ Already up to date.")
        return True

    print(f"Translating {len(to_translate)} items...")
    
    # Use Google via deep-translator (No API key needed)
    translator = GoogleTranslator(source='en', target=LANG_MAP.get(lang_code, lang_code))
    
    # Translate values
    for i, (key, text) in enumerate(to_translate.items()):
        try:
            # Note: Deep-translator handles the request/response logic internally
            lang_flat[key] = translator.translate(text)
            if i % 5 == 0: print(f" Progress: {i}/{len(to_translate)}", end='\r')
        except Exception as e:
            print(f"\n⚠️ Error translating '{key}': {e}")

    # Restore structure and Save
    updated_data = unflatten_dict(lang_flat)
    save_json(lang_path, updated_data)
    return True

def main():
    languages = {'fr': 'French', 'de': 'German', 'vi': 'Vietnamese', 'cn': 'Chinese'}
    for code, name in languages.items():
        process_language(code, name)
    print("\n✨ All tasks complete.")

if __name__ == '__main__':
    main()
