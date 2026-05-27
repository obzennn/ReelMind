import sys
import re

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    text = f.read()

# remove block comments
text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
# remove line comments
text = re.sub(r'//.*', '', text)

# remove strings (naive)
text = re.sub(r'"(?:\\.|[^"\\])*"', '', text)
text = re.sub(r"'(?:\\.|[^'\\])*'", '', text)
text = re.sub(r"`(?:\\.|[^`\\])*`", '', text)

opens = text.count('{')
closes = text.count('}')
open_p = text.count('(')
close_p = text.count(')')
open_b = text.count('[')
close_b = text.count(']')

print(f"Code only {{: {opens}, }}: {closes}")
print(f"Code only (: {open_p}, ): {close_p}")
print(f"Code only [: {open_b}, ]: {close_b}")
