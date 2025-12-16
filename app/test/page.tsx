import React, { useEffect } from 'react'

function TestPage() {
    useEffect(() => {
        console.log('TestPage')
    }, [])
  return (
    <div className='flex justify-center items-center h-screen'>TestPage</div>
  )
}

export default TestPage