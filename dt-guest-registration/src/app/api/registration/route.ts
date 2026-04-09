import { NextRequest, NextResponse } from "next/server";


async function sendEmailNotification(fields: Record<string, string>, attachments: any[]) {
    try {
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Arial', sans-serif; background-color: #FDFBF7; padding: 40px 20px; color: #214352; margin: 0; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ebe6df; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(191,161,130,0.1); }
                .header { background-color: #ffffff; padding: 40px 30px; text-align: center; border-bottom: 2px solid #bfa182; }
                .header h1 { margin: 0; font-family: 'Georgia', serif; font-size: 24px; color: #214352; letter-spacing: 4px; text-transform: uppercase; font-weight: 400; }
                .header p { margin: 10px 0 0 0; color: #bfa182; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; }
                .content { padding: 40px 30px; }
                .section-title { font-family: 'Georgia', serif; color: #bfa182; font-size: 18px; margin-bottom: 25px; border-bottom: 1px solid #f0ebe3; padding-bottom: 15px; letter-spacing: 2px; text-transform: uppercase; }
                .data-row { margin-bottom: 20px; }
                .label { font-size: 11px; font-weight: bold; color: #647c87; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 5px; display: block; }
                .value { font-size: 16px; color: #214352; margin: 0; padding: 12px 15px; background-color: #FAFAFA; border: 1px solid #ebe6df; }
                .images-grid { margin-top: 30px; }
                .image-box { margin-bottom: 20px; text-align: center; background-color: #FAFAFA; padding: 20px; border: 1px dashed #bfa182; }
                .image-box a { display: inline-block; padding: 12px 24px; background-color: #214352; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-top: 15px; border-radius: 4px; }
                .footer { background-color: #214352; color: #ffffff; text-align: center; padding: 20px; font-size: 11px; letter-spacing: 1px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Desert Tracks</h1>
                    <p>Secure Guest Registration</p>
                </div>
                <div class="content">
                    <div class="section-title">Booking Details - ${fields['Guest Index'] || 'Guest'}</div>
                    
                    <div class="data-row"><span class="label">Group Name</span><div class="value">${fields['groupName'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Tour Type</span><div class="value">${fields['tourType'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Full Name & Title</span><div class="value">${fields['guestName'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Date of Birth</span><div class="value">${fields['dob'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Nationality</span><div class="value">${fields['nationality'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Passport Number</span><div class="value">${fields['passportNumber'] || 'N/A'} (Exp: ${fields['passportExpiry'] || 'N/A'})</div></div>
                    <div class="data-row"><span class="label">Mobile Number</span><div class="value">${fields['mobile'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Body Weight (KG)</span><div class="value">${fields['weight'] || 'N/A'}</div></div>
                    <div class="data-row"><span class="label">Travel Insurance</span><div class="value">${fields['insurance'] || 'N/A'}</div></div>
                    
                    <div class="section-title" style="margin-top: 40px;">Medical & Dietary</div>
                    <div class="data-row"><span class="label">Dietary Requirements</span><div class="value">${fields['dietary'] || 'None'}</div></div>
                    <div class="data-row"><span class="label">Medical Conditions</span><div class="value">${fields['medical'] || 'None'}</div></div>
                    <div class="data-row"><span class="label">Emergency Contact</span><div class="value">${fields['emergencyContact'] || 'N/A'}</div></div>

                    <div class="section-title" style="margin-top: 40px;">Encrypted Documents</div>
                    <div class="images-grid">
                        <div class="image-box">
                            <span class="label">Documentation attached</span>
                            <div style="color: #647c87; font-style: italic; margin-top: 10px;">Please check the attachments on this email for the provided Passport and Driver's License files.</div>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Desert Tracks Africa | Automated Secure Registration System
                </div>
            </div>
        </body>
        </html>
        `;

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                'Authorization': `Bearer re_hd2sDeEH_LRMUGke7DF24qGzBJMjidFYk`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Desert Tracks Registration <onboarding@resend.dev>',
                to: ['bookings@desert-tracks.com'],
                subject: `New Guest Registration: ${fields['groupName'] || 'Booking'}`,
                html: htmlContent,
                attachments: attachments
            })
        });

        const data = await res.json();
        console.log("Resend Mailer Response:", data);
    } catch (err) {
        console.error("Custom Mailer Notification Error:", err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        let fields: Record<string, string> = {};
        let files: Record<string, File> = {};

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                files[key] = value;
            } else {
                fields[key] = value.toString();
            }
        }

        // 1. Prepare attachments for Resend
        let attachments: any[] = [];

        if (files['passportFile']) {
            const buffer = Buffer.from(await files['passportFile'].arrayBuffer());
            const cleanName = files['passportFile'].name.replace(/[^a-zA-Z0-9.\-_]/g, '');
            attachments.push({
                filename: `passport_${cleanName}`,
                content: Array.from(buffer)
            });
        }

        if (files['licenseFile']) {
            const buffer = Buffer.from(await files['licenseFile'].arrayBuffer());
            const cleanName = files['licenseFile'].name.replace(/[^a-zA-Z0-9.\-_]/g, '');
            attachments.push({
                filename: `license_${cleanName}`,
                content: Array.from(buffer)
            });
        }

        // 2. Trigger the Email Notification via Resend, passing attachments
        await sendEmailNotification(fields, attachments);

        return NextResponse.json({ success: true, message: "Registration successful" });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
    }
}
