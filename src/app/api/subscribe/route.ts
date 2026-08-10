import { NextResponse } from 'next/server'
import { z } from 'zod'
import { WelcomeEmail } from '@/components/emails/WelcomeEmail'
import { createEmailClient } from '@/lib/email'

const SubscribeSchema = z.object({
  email: z.string().email('Enter a valid email address')
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SubscribeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? 'Invalid email' },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LOOPS_API_KEY}`
      },
      body: JSON.stringify({ email, source: 'afterlife.work homepage' })
    })

    const data = await response.json()

    if (!response.ok) {
      // Loops reports an existing contact as a failure. From the subscriber's
      // side they are already on the list, which is the outcome they asked
      // for, so it is not an error to show them.
      const alreadySubscribed =
        typeof data?.message === 'string' && /already/i.test(data.message)

      if (!alreadySubscribed) {
        console.error('Loops API error:', { status: response.status, data })
        return NextResponse.json(
          { success: false, message: 'We could not add you to the list. Try again shortly.' },
          { status: 502 }
        )
      }

      return NextResponse.json({ success: true, message: "You're already on the list." })
    }

    // The welcome mail is sent after the contact exists, and its failure does
    // not fail the subscription: the person is on the list either way, and
    // telling them otherwise would invite a duplicate signup.
    try {
      // createEmailClient resolves the verified from-address per type.
      await createEmailClient().send({
        type: 'system',
        to: email,
        subject: 'Welcome to Afterlife',
        react: WelcomeEmail({ name: 'there', isDesigner: false })
      })
    } catch (emailError) {
      console.error('Welcome email failed for', email, emailError)
    }

    return NextResponse.json({ success: true, message: 'Thanks for subscribing.' })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Try again shortly.' },
      { status: 500 }
    )
  }
}
