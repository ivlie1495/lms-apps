import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'

import { getCourses } from '@/actions/courses'
import CourseList from '@/components/course-list'
import SearchInput from '@/components/search-input'
import { db } from '@/services/db'

import Categories from './_components/categories'

interface Props {
  searchParams: {
    title: string
    categoryId: string
  }
}

const SearchPage = async ({ searchParams }: Props) => {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  const courses = await getCourses({
    userId,
    ...searchParams,
  })

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categories} />
        <CourseList items={courses} />
      </div>
    </>
  )
}

export default SearchPage
