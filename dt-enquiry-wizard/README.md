# DT Enquiry Wizard - WordPress Plugin

A production-ready, front-end multi-step enquiry wizard that is an EXACT replica of the Wilderness Destinations enquiry experience.

## Features

- **Vanilla Tech Stack:** HTML, CSS, and JS only (No frameworks).
- **Single Page Wizard:** Smooth transitions without page reloads.
- **URL Syncing:** Automatically updates `?_enquiry=N` in the URL for better UX and bookmarking.
- **History API Support:** Browser Back/Forward buttons work as expected.
- **Conditional Routing:** Skips steps based on user selection (e.g., Calendar step is only shown if "Exactly When" is selected).
- **Mobile Responsive:** Optimized for all screen sizes.

## Installation

1. Upload the `dt-enquiry-wizard` folder to your WordPress site's `/wp-content/plugins/` directory.
2. Log in to your WordPress Dashboard and navigate to **Plugins**.
3. Find **DT Enquiry Wizard** and click **Activate**.

## Usage

Simply place the following shortcode on any page, post, or within a popup:

`[dt_enquiry_wizard]`

The wizard will mount to the `#enquiry-wizard-root` container and automatically handle the layout and flow.

## File Structure

- `plugin/enquiry-wizard.php`: Handles shortcode registration and asset enqueuing.
- `assets/styles.css`: All pixel-perfect styling, including fonts and animations.
- `assets/wizard.js`: All logic, state management, and routing.
- `assets/background.png`: Background image for the wizard overlay.

## State Model

The wizard maintains a central state object:

```json
{
  "currentStep": 1,
  "answers": {
    "country": "Namibia",
    "travelTiming": "exactly",
    "travelDates": "...",
    "travellers": "Couple",
    "budget": "USD 10K - 20K"
  }
}
```
