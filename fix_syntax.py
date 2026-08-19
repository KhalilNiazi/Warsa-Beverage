with open('src/components/PrintOrderView.tsx', 'r') as f:
    content = f.read()

# Fix the stray `return (` 
# Looking for `  return (\n    const SingleInvoice`
content = content.replace("  return (\n    \n  const SingleInvoice", "  const SingleInvoice")
content = content.replace("  return (\n\n  const SingleInvoice", "  const SingleInvoice")
content = content.replace("  return (\n  const SingleInvoice", "  const SingleInvoice")
content = content.replace("  return (\n\n  const SingleInvoice", "  const SingleInvoice")
content = content.replace("return (\n  const SingleInvoice", "const SingleInvoice")
content = content.replace("return (\n\n  const SingleInvoice", "const SingleInvoice")
content = content.replace("return (\n    const SingleInvoice", "const SingleInvoice")


with open('src/components/PrintOrderView.tsx', 'w') as f:
    f.write(content)
