import sys

def audit_tags(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        line_num = i + 1
        # Simple count for divs
        opens = line.count('<div')
        closes = line.count('</div')
        
        for _ in range(opens):
            stack.append(line_num)
        for _ in range(closes):
            if stack:
                stack.pop()
            else:
                print(f"Excess closer at line {line_num}")
                
    if stack:
        print(f"Unclosed divs starting at lines: {stack}")
    else:
        print("All divs balanced!")

if __name__ == "__main__":
    audit_tags(sys.argv[1])
