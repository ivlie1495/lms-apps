import { CheckCircle, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'

import { getDashboardCourses } from '@/actions/dashboard'
import CourseList from '@/components/course-list'

import InfoCard from './_components/info-card'

const Dashboard = async () => {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId
  )

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
        />
        <InfoCard
          variant="success"
          icon={CheckCircle}
          label="Completed"
          numberOfItems={completedCourses.length}
        />
      </div>
      <CourseList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  )
}

export default Dashboard
