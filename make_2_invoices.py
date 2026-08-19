with open('src/components/PrintOrderView.tsx', 'r') as f:
    content = f.read()

# Replace #4b5563 with #374151 for consistency
content = content.replace('bg-[#4b5563]', 'bg-[#374151]')

# Extract the big block
start_idx = content.find('<div className="hidden print:block w-full max-w-[800px] mx-auto bg-white text-black font-sans p-0 m-0">')
end_idx = content.rfind('</div>', 0, content.rfind(');'))

main_div_content = content[start_idx:end_idx + 6]

# Remove the <style> block from inside the main div content, we will move it to the parent
style_start = main_div_content.find('<style type="text/css" media="print">')
style_end = main_div_content.find('</style>', style_start) + 8
style_block = main_div_content[style_start:style_end]

main_div_content = main_div_content[:style_start] + main_div_content[style_end:]

# Replace the wrapper div class of the single invoice to make it scale correctly side-by-side
main_div_content = main_div_content.replace(
    '<div className="hidden print:block w-full max-w-[800px] mx-auto bg-white text-black font-sans p-0 m-0">',
    '<div className="w-[49%] shrink-0 bg-white text-black font-sans p-0 m-0" style={{ transform: "scale(0.92)", transformOrigin: "top" }}>'
)

new_return = f"""
  const SingleInvoice = () => (
    {main_div_content}
  );

  return (
    <div className="hidden print:flex flex-row w-full justify-between gap-2 max-w-[297mm] mx-auto">
      {style_block.replace('portrait', 'landscape')}
      <SingleInvoice />
      <SingleInvoice />
    </div>
  );
"""

new_content = content[:start_idx] + new_return + content[end_idx + 6:]

with open('src/components/PrintOrderView.tsx', 'w') as f:
    f.write(new_content)
