'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import SplineScene from '../../components/spline'
import InterviewCard from '@/components/InterviewCard'
import { dummyInterviews } from '@/constants'

// import { getCurrentUser } from '@/lib/actions/auth.action';
// import {
//   getInterviewsByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/general.action";

const Page=()=>{

  return (
     <>
      <section className="card-cta xl:h-150">
        <div className="flex flex-col max-xl:items-center gap-6 max-xl:text-center z-50">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className=" btn-primary max-sm:w-full hover:scale-105">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <div className="relative max-xl:hidden flex justify-end items-center w-[70vw] h-19/20">
          <SplineScene/>
        </div>

      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
            {dummyInterviews.length > 0 ? (
              dummyInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  // userId={interview.userId}
                  // interviewId={interview.id}
                  // role={interview.role}
                  // type={interview.type}
                  // techstack={interview.techstack}
                  // createdAt={interview.createdAt}
                  {...interview}
                />
              ))
            ) : (
            <p>You haven&apos;t taken any interviews yet</p>
            )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {dummyInterviews.length > 0 ? (
              dummyInterviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  // userId={interview.userId}
                  // interviewId={interview.id}
                  // role={interview.role}
                  // type={interview.type}
                  // techstack={interview.techstack}
                  // createdAt={interview.createdAt}
                  {...interview}
                />
              ))
            ) : (
            <p>There are no Interview available</p>
            )}
        </div>
      </section>
    </>
  )
}

export default Page
