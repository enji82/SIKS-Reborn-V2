import re
import sys

def fix_css(input_path, output_path):
    with open(input_path, 'r') as f:
        lines = f.readlines()

    repaired = []
    in_block = False
    
    # Common CSS selector starters
    selector_start = re.compile(r'^(\.|\#|[a-z*@])', re.IGNORECASE)
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # Detect start of a block
        if '{' in stripped:
            if in_block and not stripped.startswith('@keyframes') and not stripped.startswith('0%') and not stripped.startswith('10%') and not stripped.startswith('20%') and not stripped.startswith('30%') and not stripped.startswith('40%') and not stripped.startswith('50%') and not stripped.startswith('60%') and not stripped.startswith('70%') and not stripped.startswith('100%') and not stripped.startswith('to') and not stripped.startswith('from'):
                # We were already in a block, a new one is starting, but it might be nested (media query) or broken
                pass
            in_block = True
            repaired.append(line)
            continue
            
        # Detect end of a block
        if '}' in stripped:
            in_block = False
            repaired.append(line)
            continue
            
        # Detect a new selector on a new line while still "in_block"
        if in_block and selector_start.match(stripped) and i > 0:
            # Check if previous non-empty line ends with ; or is a comment
            # Most likely we missed a }
            prev_line = repaired[-1].strip()
            if prev_line and not prev_line.endswith('{') and not prev_line.endswith('}'):
                # Inject closing brace
                repaired.append('}\n')
                in_block = False
        
        # Handle cases where in_block is true but we hit a comment that looks like a section header
        if in_block and stripped.startswith('/*') and '===' in stripped:
             repaired.append('}\n')
             in_block = False

        repaired.append(line)

    # Clean up double style tags
    content = "".join(repaired)
    content = content.replace('</style>\n</style>', '</style>')
    
    with open(output_path, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_css(sys.argv[1], sys.argv[2])
