import { NextRequest, NextResponse } from "next/server";

const WP_API = "https://desert-tracks.com/wp-json/wp/v2";
const WP_USER = "jaun";
const WP_PASS = "bSoS lEVi WwzY xqJ0 n73k mRYr";
const WP_AUTH = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');

async function uploadToWordPress(file: File, filename: string): Promise<string | null> {
    try {
        const buffer = await file.arrayBuffer();
        const res = await fetch(`${WP_API}/media`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${WP_AUTH}`,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': file.type,
            },
            body: buffer
        });

        if (!res.ok) {
            console.error("Failed to upload image:", await res.text());
            return null;
        }

        const data = await res.json();
        return data.source_url;
    } catch (err) {
        console.error("WP Upload Error:", err);
        return null;
    }
}

async function sendEmailNotification(fields: any) {
    try {
        await fetch("https://formsubmit.co/ajax/info@desert-tracks.com", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `New Guest Registration: ${fields['guestName']}`,
                _template: "box",
                ...fields
            })
        });
    } catch (err) {
        console.error("Email notification error:", err);
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

        // 1. Upload the high-res passport and license to WP Media Library directly securely
        let passportUrl = "No passport uploaded";
        let licenseUrl = "No license uploaded";

        if (files['passportFile']) {
            const safeName = `passport_${Date.now()}_${files['passportFile'].name}`;
            const url = await uploadToWordPress(files['passportFile'], safeName);
            if (url) passportUrl = url;
        }

        if (files['licenseFile']) {
            const safeName = `license_${Date.now()}_${files['licenseFile'].name}`;
            const url = await uploadToWordPress(files['licenseFile'], safeName);
            if (url) licenseUrl = url;
        }

        // Add URLs to fields for the email
        fields["Passport Photo URL"] = passportUrl;
        fields["Driver's License Photo URL"] = licenseUrl;

        // 2. Trigger the Email Notification via FormSubmit
        await sendEmailNotification(fields);

        // 3. Optional: Create a Private/Draft Post in WordPress just as a secure backup!
        const postContent = `
            <h2>Client Booking Information</h2>
            <ul>
                ${Object.entries(fields).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
            </ul>
            <h3>Uploaded Documents</h3>
            <p><strong>Passport:</strong> <br/><a href="${passportUrl}" target="_blank"><img src="${passportUrl}" style="max-height: 400px;"/></a></p>
            <p><strong>Driver's License:</strong> <br/><a href="${licenseUrl}" target="_blank"><img src="${licenseUrl}" style="max-height: 400px;"/></a></p>
        `;

        await fetch(`${WP_API}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${WP_AUTH}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `Secure Guest Registration: ${fields['guestName'] || 'Unknown'}`,
                content: postContent,
                status: 'private', // Saves as private so only admins can see
                categories: []
            })
        });

        return NextResponse.json({ success: true, message: "Registration successful" });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
    }
}
