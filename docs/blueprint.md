# **App Name**: MedMinder

## Core Features:

- User Authentication: Secure user login/signup with JWT, storing credentials (email, password hash, name).
- Medicine Image Analysis: Upload/capture medicine photo; use Gemini Vision to extract dosage, timing, use, and description as a tool .
- Medicine Schedule Management: Allow users to confirm and store medicine schedules (name, schedule, dose, duration, usage) in MongoDB.
- Reminder Notifications: Provide local, time-based reminders for scheduled medicines, with optional email notifications.
- Home Screen Dashboard: Display today’s medicines with time-based reminders, countdown to next reminder, and reward progress.
- History Tracking: Track taken medicines, missed doses, and earned points in a history log.
- Rewards System: Award points for confirmed medicine intake.

## Style Guidelines:

- Primary color: Light blue (#ADD8E6) for calmness and reliability.
- Background color: Off-white (#F5F5F5) to ensure a clean and modern backdrop.
- Accent color: Soft teal (#70DBD0) for highlights and interactive elements.
- Body and headline font: 'PT Sans', a humanist sans-serif, which balances modernity with warmth.
- Pill, alarm, and rewards icons designed with a modern and friendly aesthetic.
- Mobile-first responsive design with card-style medicine listings and pill-shaped buttons.
- Subtle transitions and animations for a smooth user experience.