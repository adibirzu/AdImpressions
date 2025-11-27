# AdImpressions Frontend

A modern React + TypeScript frontend for the AdImpressions advertising rating platform.

## Features

- **Modern Tech Stack**: React 18, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first design with dark theme
- **Video Platform**: Integrated video player supporting YouTube, Vimeo, and more
- **Real-time Voting**: Upvote/downvote system for advertisements
- **Analytics Dashboard**: Visualize voting trends and platform statistics
- **Admin Panel**: Manage and moderate advertisements
- **Authentication**: Secure user registration and login

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Player** - Video playback
- **Recharts** - Data visualization
- **React Testing Library** - Testing utilities

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (see main project README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### Development

Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### Testing

```bash
npm test
```

Run tests in watch mode for development.

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable React components
│   │   ├── common/      # Shared UI components
│   │   ├── ads/         # Ad-related components
│   │   ├── voting/      # Voting components
│   │   └── analytics/   # Analytics components
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React context providers
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Key Features

### Components

- **AdCard**: Display ad thumbnail with voting controls
- **AdPlayer**: Embedded video player with view tracking
- **VoteButtons**: Interactive upvote/downvote controls
- **AnalyticsChart**: Configurable charts for data visualization
- **Header/Footer**: Consistent navigation and branding

### Pages

- **HomePage**: Browse and filter advertisements
- **AdViewPage**: Watch and vote on individual ads
- **AnalyticsPage**: View platform statistics and trends
- **LoginPage/RegisterPage**: User authentication
- **AdminPage**: Ad moderation and management

### Services

- **adsService**: Advertisement CRUD operations
- **votingService**: Voting functionality
- **authService**: User authentication
- **analyticsService**: Platform analytics

### Custom Hooks

- **useAuth**: Authentication state and operations
- **useAds**: Fetch and manage advertisements
- **useVoting**: Handle voting with real-time updates

## Styling

The app uses a dark theme optimized for video content:

- **Primary Color**: Red (#ef4444) for CTAs and highlights
- **Dark Backgrounds**: Various shades of dark gray
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Animations**: Smooth transitions and hover effects

## API Integration

All API calls go through the service layer with:

- Automatic authentication token handling
- Error handling and retry logic
- Type-safe request/response handling
- Centralized API client configuration

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)
- `npm run lint` - Lint TypeScript files

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_WS_URL` - WebSocket URL (if using real-time features)
- `REACT_APP_ENV` - Environment (development/production)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow TypeScript best practices
2. Use functional components with hooks
3. Maintain consistent code style
4. Write tests for new features
5. Update documentation as needed

## License

See main project LICENSE file.
