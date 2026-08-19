import re

with open('src/pages/Sales.tsx', 'r') as f:
    content = f.read()

# Fix the end tag that got mangled if it did
# Actually let's just do a manual string replace for the opening block.
# We'll find exactly what's there.

content = content.replace('''        {isRecording && (
          <Card className="border-slate-200/60 shadow-md">
            <CardHeader>
              <CardTitle>New Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordSale} className="space-y-6">''', 
'''      <ResponsiveDialog 
        isOpen={isRecording} 
        onClose={() => setIsRecording(false)} 
        title="New Order"
      >
        <form onSubmit={handleRecordSale} className="space-y-6 pb-12 md:pb-0">''')

# We also need to fix the closing tags that we messed up previously. Wait, let's look at what is at the end.
# In `cat src/pages/Sales.tsx | sed -n '335,360p'` I saw:
#         </form>
#       </ResponsiveDialog>
#       )}
#
# But wait, we replaced the `isRecording && (` opening with nothing. Oh wait, `isRecording && (` is still there.
# Let's fix the opening to remove `isRecording && (` 

content = content.replace('''        {isRecording && (
          <Card className="border-slate-200/60 shadow-md">
            <CardHeader>
              <CardTitle>New Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordSale} className="space-y-6">''', 
'''      <ResponsiveDialog 
        isOpen={isRecording} 
        onClose={() => setIsRecording(false)} 
        title="New Order"
      >
        <form onSubmit={handleRecordSale} className="space-y-6 pb-12 md:pb-0">''')

# Wait, `isRecording && (` is at line 211.
with open('src/pages/Sales.tsx', 'w') as f:
    f.write(content)
