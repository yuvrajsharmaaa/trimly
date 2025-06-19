# URL Shortener

A modern URL shortening service built with React, Vite, and Supabase. Create short, custom URLs and track their performance with detailed analytics.

## Features

- 🔗 Create short URLs instantly
- 🎯 Custom URL slugs
- 📊 Track clicks and analytics
- 👤 User authentication
- 📱 Responsive design
- 🌐 Device and location statistics

## Tech Stack

- **Frontend**: React + Vite
- **UI Components**: Shadcn/ui
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd URL_shortener
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The app should now be running on `http://localhost:5173`

## Environment Setup

Make sure to set up your Supabase project with the following:

1. Create a new Supabase project
2. Set up the following tables:
   - `urls` - for storing shortened URLs
   - Enable Row Level Security (RLS)
3. Configure authentication methods as needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
