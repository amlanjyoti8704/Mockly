import Agent from '@/components/Agent'
import React from 'react'


const Page=()=>{

    return (
        <>
            <h2>Interview Generation</h2>
            <Agent userName='You' userId="user1" type='generate'/>
        </>
    )
}

export default Page
