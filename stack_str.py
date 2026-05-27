import sys

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    text = f.read()

def check_quotes(text):
    in_str = None
    for i, char in enumerate(text):
        if char in '"\'`':
            if in_str is None:
                in_str = char
            elif in_str == char:
                # check if escaped
                escaped = False
                j = i - 1
                while j >= 0 and text[j] == '\\':
                    escaped = not escaped
                    j -= 1
                if not escaped:
                    in_str = None
    if in_str:
        print(f"Unclosed string: {in_str}")
    else:
        print("All strings are closed!")

check_quotes(text)
