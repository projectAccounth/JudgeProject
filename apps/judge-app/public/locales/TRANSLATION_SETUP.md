# Translation Script Setup

This folder contains a Python script to automatically translate JSON translation files using Google Translate API.

## Quick Start

### Option 1: Using google-trans-new (Free, No Setup)

```bash
pip install google-trans-new
cd apps/judge-app/public/locales
python translate_api.py
```

**Pros:** Free, no API key needed  
**Cons:** Rate-limited, slower

### Option 2: Using Google Cloud Translation API (Recommended)

1. **Set up Google Cloud credentials:**
   ```bash
   # Install
   pip install google-cloud-translate

   # Create service account:
   # https://console.cloud.google.com/iam-admin/serviceaccounts
   
   # Set environment variable (Windows):
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json
   
   # Or (PowerShell):
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account-key.json"
   
   # Or (macOS/Linux):
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

2. **Run the script:**
   ```bash
   cd apps/judge-app/public/locales
   python translate_api.py
   ```

**Pros:** Fast, no rate limits, accurate  
**Cons:** Requires API key, may have costs (but Google Cloud has free tier)

## How It Works

1. Reads `en/translation.json` as source
2. For each language (FR, DE, VI, CN):
   - Compares with existing translation file
   - Finds keys that are still in English (not yet translated)
   - Translates those keys using the selected API
   - Updates the language file
3. Skips keys that are already translated

## Script Features

- ✅ Smart detection of untranslated keys
- ✅ Batch translation (efficient)
- ✅ Automatic fallback between APIs
- ✅ Progress reporting
- ✅ Preserves existing translations
- ✅ Maintains JSON structure

## Languages Supported

| Code | Language | Target Code |
|------|----------|-------------|
| en   | English  | (source)   |
| fr   | French   | fr         |
| de   | German   | de         |
| vi   | Vietnamese | vi       |
| cn   | Chinese (Simplified) | zh-CN |

## Free Translation Alternative

For completely free translation without API keys or rate limits, consider:
- **LibreTranslate** (self-hosted or free API)
- **MyMemory** API (free, no auth needed)

To use MyMemory:
```python
# Add to translate_api.py
import requests

def translate_batch_mymemory(texts, source_lang='en', target_lang='fr'):
    translated = []
    for text in texts:
        url = f"https://api.mymemory.translated.net/get?q={text}&langpair={source_lang}|{target_lang}"
        resp = requests.get(url).json()
        translated.append(resp['responseData']['translatedText'])
    return translated
```

## Troubleshooting

**Error: "No translation library found"**
- Install: `pip install google-trans-new` or `pip install google-cloud-translate`

**Error: "GOOGLE_APPLICATION_CREDENTIALS not set"**
- Set the environment variable to your service account JSON file path

**Error: "Request failed (429)"**
- Rate limited on free tier - wait a bit and try again, or use Google Cloud API

**Translation quality issues**
- Machine translation may not be perfect
- Review translations manually for accuracy
- Consider hiring professional translators for production

## Manual Review

After running the script:
1. Review translated keys for accuracy
2. Fix any mistranslations manually
3. Commit to version control

Example: `git diff apps/judge-app/public/locales/*/translation.json`
