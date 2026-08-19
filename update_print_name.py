import re

with open('src/components/PrintOrderView.tsx', 'r') as f:
    content = f.read()

target = """              <div className="text-sm font-semibold tracking-[0.2em]">PURE WATER</div>
              <div className="text-5xl font-black tracking-tight leading-none uppercase">WARSA</div>"""
replacement = """              <div className="text-xl font-bold tracking-[0.1em] uppercase">KFM Beverages</div>
              <div className="text-4xl font-black tracking-tight leading-none uppercase mt-1">(WARSA)</div>"""

content = content.replace(target, replacement)

with open('src/components/PrintOrderView.tsx', 'w') as f:
    f.write(content)
