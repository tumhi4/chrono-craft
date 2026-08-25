with open(r'C:\Users\owais\.gemini\antigravity\brain\c91371c6-689a-4b2c-b6c0-4ec76d024c95\.system_generated\steps\3193\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re, base64

b64_results = re.findall(r'result(?:\\*")*:\s*(?:\\*")*([A-Za-z0-9+/=]{20,})', text)
print(f"Total base64 results found: {len(b64_results)}")
seen = set()
for idx, b in enumerate(b64_results):
    try:
        decoded = base64.b64decode(b).decode('utf-8', errors='ignore')
        clean = ''.join(c for c in decoded if c.isprintable() or c in '\n\r\t')
        if clean not in seen and len(clean) > 5:
            seen.add(clean)
            print(f"\n--- ON-CHAIN EXECUTION OUTPUT #{len(seen)} ---")
            print(clean)
    except Exception as e:
        pass
