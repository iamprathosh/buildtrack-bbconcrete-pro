'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function TableTest() {
  const data = [
    { id: 1, name: 'Very Long Project Name That Should Not Break Layout', status: 'Active', priority: 'High', manager: 'John Smith', budget: '$100,000', location: 'New York City', client: 'ABC Corporation', description: 'This is a very long description that should wrap properly' },
    { id: 2, name: 'Another Project', status: 'Pending', priority: 'Medium', manager: 'Jane Doe', budget: '$75,000', location: 'Los Angeles', client: 'XYZ Company', description: 'Short desc' },
    { id: 3, name: 'Third Project', status: 'Completed', priority: 'Low', manager: 'Bob Johnson', budget: '$50,000', location: 'Chicago', client: 'DEF Inc', description: 'Another description' }
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Table Scrolling Test</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Method 1: Simple Overflow Auto</h3>
        <div className="rounded-md border overflow-hidden">
          <div className="w-full overflow-auto">
            <Table className="w-full" style={{ minWidth: '1000px' }}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[250px]">Project Name</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[150px]">Manager</TableHead>
                  <TableHead className="w-[120px]">Budget</TableHead>
                  <TableHead className="w-[150px]">Location</TableHead>
                  <TableHead className="w-[150px]">Client</TableHead>
                  <TableHead className="w-[200px]">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>{item.manager}</TableCell>
                    <TableCell>{item.budget}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.client}</TableCell>
                    <TableCell>{item.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <h3 className="text-lg font-semibold">Method 2: Responsive Table with Truncation</h3>
        <div className="rounded-md border overflow-hidden">
          <div className="w-full overflow-auto">
            <Table className="w-full" style={{ minWidth: '800px' }}>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={item.name}>
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>{item.manager}</TableCell>
                    <TableCell>{item.budget}</TableCell>
                    <TableCell className="max-w-[120px]">
                      <div className="truncate" title={item.location}>
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[120px]">
                      <div className="truncate" title={item.client}>
                        {item.client}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Tables should scroll horizontally when content exceeds container width</p>
          <p>• Page should never scroll horizontally</p>
          <p>• Text in cells can be truncated with tooltips for full content</p>
        </div>
      </div>
    </div>
  )
}