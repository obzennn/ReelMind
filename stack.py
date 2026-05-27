import sys
import re

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    text = f.read()

# Replace all string contents with spaces to preserve indices but remove brackets inside them.
# We must be careful about template literals containing brackets though.
# Actually, since template literals only contain balanced brackets in this file, we can just track the stack of all brackets.

stack = []
for i, char in enumerate(text):
    if char == '{':
        stack.append(i)
    elif char == '}':
        if stack:
            stack.pop()
        else:
            print(f"Unmatched }} at index {i}")

if stack:
    print(f"Unmatched {{ at indices: {stack}")
else:
    print("All braces are matched!")
