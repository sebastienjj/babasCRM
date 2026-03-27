import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

type SendEmailOptions = {
    to: string
    subject: string
    text?: string
    html?: string
    from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const from = options.from || "Premia Studio <onboarding@resend.dev>"

    const { data, error } = await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    })

    if (error) {
        console.error("Resend error:", error)
        throw new Error(error.message)
    }

    return { success: true, messageId: data?.id }
}
