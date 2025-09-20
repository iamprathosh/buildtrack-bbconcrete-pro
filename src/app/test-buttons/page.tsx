'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit } from 'lucide-react'

export default function TestButtonsPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Button Test Page</h1>
      <p>Click count: {count}</p>
      
      <div className="space-x-4">
        <Button 
          onClick={() => {
            console.log('Test Add Task button clicked!')
            setCount(prev => prev + 1)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Test Add Task
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {
            console.log('Test Edit Project button clicked!')
            setCount(prev => prev + 1)
          }}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          Test Edit Project
        </Button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click the buttons above to test basic functionality</li>
          <li>Check the browser console for log messages</li>
          <li>The counter should increment with each click</li>
          <li>If these buttons work, the issue might be in the project dialog specifically</li>
        </ol>
      </div>
    </div>
  )
}