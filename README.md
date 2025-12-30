# Whiteboard

Your personal productivity planner with goals, habits, and insights.

## Features

- **Daily Goals**: Track your daily tasks with progress visualization
- **Weekly/Biweekly Goals**: Set and track longer-term objectives
- **Habits Tracking**: Monitor AM check-ins, PM check-ins, and goal-setting consistency
- **Daily Flags**: Track booster and XR with database persistence
- **Heatmaps**: 365-day visualization of goals and habits completion
- **Statistics**: Detailed insights into your productivity patterns
- **Countdown Timer**: Track important upcoming events
- **Look Ahead**: Plan for this week and next week

## PWA Support

Whiteboard is a Progressive Web App that can be installed on your iPhone or other devices:

### Installing on iPhone

1. Open Safari and navigate to your Whiteboard URL
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

The app will appear on your home screen with a custom icon and run in full-screen mode without browser UI.

### Icon Sizes

- Apple Touch Icon: 180x180px (`/public/whiteboard-icon-180.png`)
- PWA Icons: 192x192px (`/public/whiteboard-icon-192.png`) and 512x512px (`/public/whiteboard-icon-512.png`)
- SVG Icon: Scalable vector (`/public/whiteboard-icon.svg`)

All PNG icons are generated from the source SVG using ImageMagick.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Radix UI + Tailwind CSS
- **Database**: Supabase
- **Charts**: Recharts, @uiw/react-heat-map
- **Analytics**: Vercel Analytics

## Database Schema

### Tables

- `daily_goals`: Daily task tracking
- `weekly_goals`: Weekly/biweekly objectives
- `discipline_tracking`: Habit check-ins (AM, PM, goal-setting)
- `daily_flags`: Booster and XR tracking
- `lookahead_items`: This week and next week planning items
- `countdown_events`: Event countdown tracking

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Author

Created by Riya

## License

Private
