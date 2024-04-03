import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { stripe } from '@/utils/payment'
import { db } from '@/services/db'

const stripeConstructEvent = (body: string, signature: string) => {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (e) {
    console.log('[WEBHOOK_CONSTRUCT_EVENT]', e)
    return null
  }
}

export const POST = async (req: Request) => {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  const event = stripeConstructEvent(body, signature)

  if (!event) {
    return new NextResponse('Webhook Construct Event Failed', { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const { userId, courseId } = session.metadata || {}

  if (event.type === 'checkout.session.completed') {
    if (!userId || !courseId) {
      return new NextResponse('Webhook Missing Metadata', { status: 400 })
    }

    await db.purchase.create({
      data: {
        courseId,
        userId,
      },
    })

    return new NextResponse(null, { status: 200 })
  } else {
    return new NextResponse(`Webhook Unhandled Event Type ${event.type}`, {
      status: 200,
    })
  }
}
