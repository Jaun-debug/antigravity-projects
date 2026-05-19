export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { from, to, subject, html } = req.body;

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                'Authorization': 'Bearer re_hd2sDeEH_LRMUGke7DF24qGzBJMjidFYk',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: from || 'Registration System <onboarding@resend.dev>',
                to: to || ['bookings@desert-tracks.com'],
                subject: subject || 'New Guest Registration',
                html: html,
                attachments: req.body.attachments
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Resend API Error:', errorData);
            return res.status(500).json({ error: 'Failed to send email via Resend' });
        }

        const data = await response.json();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
