"""
generate_medium_html.py
Converts BLOG.md into a Medium-ready rich HTML document (docs/blog_medium_ready.html).
When opened in a browser, you can press Ctrl+A -> Ctrl+C and paste into Medium:
All headings, bolding, blockquotes, code blocks, and lists will paste as native Medium elements
with ZERO raw markdown syntax symbols (no ##, no **, no *, no raw < >).
"""

import html
import re
from pathlib import Path

DOCS_DIR = Path(__file__).resolve().parent
ROOT_DIR = DOCS_DIR.parent
BLOG_MD_PATH = ROOT_DIR / "BLOG.md"
OUT_HTML_PATH = DOCS_DIR / "blog_medium_ready.html"

def convert_markdown_to_medium_html():
    with open(BLOG_MD_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    lines = text.splitlines()
    html_out = []
    
    html_out.append("<!DOCTYPE html>")
    html_out.append("<html lang='en'>")
    html_out.append("<head>")
    html_out.append("<meta charset='UTF-8'>")
    html_out.append("<title>Engineering SupportNova: Dual-Pipeline AI Governance (Medium Ready)</title>")
    html_out.append("<style>")
    html_out.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; max-width: 740px; margin: 40px auto; padding: 0 20px; color: #242424; }")
    html_out.append("h1 { font-size: 38px; line-height: 1.2; font-weight: 700; margin-bottom: 8px; color: #000; }")
    html_out.append("h2 { font-size: 28px; line-height: 1.3; font-weight: 700; margin-top: 40px; margin-bottom: 12px; color: #000; }")
    html_out.append("h3 { font-size: 22px; line-height: 1.4; font-weight: 600; margin-top: 28px; margin-bottom: 8px; color: #111; }")
    html_out.append("p { font-size: 18px; margin-bottom: 20px; color: #242424; letter-spacing: -0.003em; }")
    html_out.append("blockquote { border-left: 3px solid #242424; padding-left: 20px; margin-left: 0; margin-right: 0; font-style: italic; color: #555; }")
    html_out.append("pre { background: #f2f2f2; padding: 16px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', Courier, monospace; font-size: 15px; }")
    html_out.append("code { font-family: 'Courier New', Courier, monospace; background: #f2f2f2; padding: 2px 4px; border-radius: 3px; font-size: 15px; }")
    html_out.append("ul, ol { font-size: 18px; margin-bottom: 20px; padding-left: 30px; }")
    html_out.append("li { margin-bottom: 8px; }")
    html_out.append("hr { border: 0; height: 1px; background: #e0e0e0; margin: 40px 0; }")
    html_out.append("table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 16px; }")
    html_out.append("th, td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; }")
    html_out.append("th { background: #f8f8f8; font-weight: bold; }")
    html_out.append("</style>")
    html_out.append("</head>")
    html_out.append("<body>")

    in_code_block = False
    code_lines = []
    in_list = False
    list_type = ""
    in_table = False
    table_rows = []

    def format_inline(s):
        # Escape raw HTML brackets first
        # But allow intentional tags if needed
        # Bold **text**
        s = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', s)
        # Italic *text*
        s = re.sub(r'\*(.*?)\*', r'<em>\1</em>', s)
        # Inline code `code`
        s = re.sub(r'`(.*?)`', lambda m: f"<code>{html.escape(m.group(1))}</code>", s)
        return s

    i = 0
    while i < len(lines):
        line = lines[i]

        # Skip self-referential header for Medium
        if line.startswith("> **Official Medium Publication:**"):
            i += 1
            continue

        # Code block handling
        if line.strip().startswith("```"):
            if not in_code_block:
                in_code_block = True
                code_lines = []
            else:
                in_code_block = False
                escaped_code = html.escape("\n".join(code_lines))
                html_out.append(f"<pre><code>{escaped_code}</code></pre>")
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Close open list if line is not a list item
        if in_list and not (line.strip().startswith("- ") or line.strip().startswith("* ") or re.match(r'^\d+\.\s+', line.strip())):
            html_out.append(f"</{list_type}>")
            in_list = False

        # Close table if line is not a table row
        if in_table and not line.strip().startswith("|"):
            html_out.append("</table>")
            in_table = False

        # Horizontal Rule
        if line.strip() in ["---", "***", "___"]:
            html_out.append("<hr />")
            i += 1
            continue

        # Headings
        if line.startswith("# "):
            title = format_inline(line[2:].strip())
            html_out.append(f"<h1>{title}</h1>")
            i += 1
            continue

        if line.startswith("## "):
            h2 = format_inline(line[3:].strip())
            html_out.append(f"<h2>{h2}</h2>")
            i += 1
            continue

        if line.startswith("### "):
            h3 = format_inline(line[4:].strip())
            html_out.append(f"<h3>{h3}</h3>")
            i += 1
            continue

        if line.startswith("#### "):
            h4 = format_inline(line[5:].strip())
            html_out.append(f"<h4>{h4}</h4>")
            i += 1
            continue

        # Blockquote
        if line.startswith("> "):
            bq = format_inline(line[2:].strip())
            html_out.append(f"<blockquote><p>{bq}</p></blockquote>")
            i += 1
            continue

        # Table rows
        if line.strip().startswith("|") and "|" in line.strip()[1:]:
            r_line = line.strip()
            # Skip separator line |---|---|
            if re.match(r'^\|[\s\-:]+(\|[\s\-:]+)+\|$', r_line):
                i += 1
                continue
            if not in_table:
                in_table = True
                html_out.append("<table>")
                is_first_row = True
            else:
                is_first_row = False

            cells = [c.strip() for c in r_line.strip("|").split("|")]
            tag = "th" if is_first_row else "td"
            row_html = "<tr>" + "".join(f"<{tag}>{format_inline(c)}</{tag}>" for c in cells) + "</tr>"
            html_out.append(row_html)
            i += 1
            continue

        # Unordered list
        if line.strip().startswith("- ") or line.strip().startswith("* "):
            if not in_list or list_type != "ul":
                if in_list:
                    html_out.append(f"</{list_type}>")
                in_list = True
                list_type = "ul"
                html_out.append("<ul>")
            item_text = format_inline(line.strip()[2:].strip())
            html_out.append(f"<li>{item_text}</li>")
            i += 1
            continue

        # Ordered list
        m_num = re.match(r'^(\d+)\.\s+(.*)$', line.strip())
        if m_num:
            if not in_list or list_type != "ol":
                if in_list:
                    html_out.append(f"</{list_type}>")
                in_list = True
                list_type = "ol"
                html_out.append("<ol>")
            item_text = format_inline(m_num.group(2).strip())
            html_out.append(f"<li>{item_text}</li>")
            i += 1
            continue

        # Regular paragraph
        if line.strip():
            p_text = format_inline(line.strip())
            html_out.append(f"<p>{p_text}</p>")

        i += 1

    if in_list:
        html_out.append(f"</{list_type}>")
    if in_table:
        html_out.append("</table>")

    html_out.append("</body>")
    html_out.append("</html>")

    out_content = "\n".join(html_out)
    with open(OUT_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(out_content)

    print(f"[Medium HTML Gen] Successfully generated: {OUT_HTML_PATH} ({OUT_HTML_PATH.stat().st_size:,} bytes)")
    return OUT_HTML_PATH

if __name__ == "__main__":
    convert_markdown_to_medium_html()
