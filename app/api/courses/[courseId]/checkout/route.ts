import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs'

import { db } from '@/services/db'
import { stripe } from '@/utils/payment'

interface ParamsProps {
  params: {
    courseId: string
  }
}

export const POST = async (req: Request, { params }: ParamsProps) => {
  try {
    const { courseId } = params
    const user = await currentUser()

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
    })

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          courseId,
          userId: user.id,
        },
      },
    })

    if (!course) {
      return new NextResponse('Not Found', { status: 404 })
    }

    if (purchase) {
      return new NextResponse('Already Purchased', { status: 400 })
    }

    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: 'SGD',
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(course.price! * 100),
        },
      },
    ]

    let customer = await db.stripeCustomer.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    })

    if (!customer) {
      const newCustomer = await stripe.customers.create({
        email: user.emailAddresses?.[0]?.emailAddress,
      })

      customer = await db.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId: newCustomer.id,
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.stripeCustomerId,
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
      metadata: {
        courseId: course.id,
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.log('[COURSES_ID_CHECKOUT_POST]', e)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
