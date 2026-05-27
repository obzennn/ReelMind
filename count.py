import sys

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    text = f.read()

opens = text.count('{')
closes = text.count('}')
open_p = text.count('(')
close_p = text.count(')')
open_b = text.count('[')
close_b = text.count(']')

print(f"{{: {opens}, }}: {closes}")
print(f"(: {open_p}, ): {close_p}")
print(f"[: {open_b}, ]: {close_b}")

# Also let's check string literal bounds to be sure
print(f"': {text.count(chr(39))}, \": {text.count(chr(34))}, `: {text.count('`')}")
