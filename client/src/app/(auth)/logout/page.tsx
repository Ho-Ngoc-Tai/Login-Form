'use client'

import { Suspense } from 'react'
import LogoutForm from './logout-form'

export default function LogoutPage() {
  return (
    <Suspense>
      <div className="flex justify-center items-center min-h-screen">
        <div className="max-w-sm w-full">
          <LogoutForm />
        </div>
      </div>
    </Suspense>
  )
}
