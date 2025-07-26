# Socialize Project Information

## Project Overview
Socialize is a modern social networking application built with:
- Frontend: Next.js 14 with TypeScript and Tailwind CSS
- Backend: Express.js with MongoDB and Socket.io
- Authentication: JWT-based authentication system
- Testing: Jest, Cypress, React Testing Library with 100% coverage

## Key Commands

### Development
- `npm run dev` - Start both frontend and backend dev servers
- `npm run server:dev` - Start backend only
- `npm run client:dev` - Start frontend only

### Testing
- `npm test` - Run all unit and integration tests with coverage
- `npm run test:e2e` - Run Cypress E2E tests
- `npm run test:all` - Run all tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Building
- `npm run build` - Build production frontend
- `npm start` - Start production server

## Testing Philosophy
- Unit tests for all models, controllers, and components
- Integration tests for all API endpoints
- E2E tests for critical user flows
- 100% code coverage requirement enforced

## Project Structure
```
socialize/
├── server/           # Backend code
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth and other middleware
│   └── tests/        # Backend tests
├── client/           # Frontend code
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── tests/        # Frontend tests
└── cypress/          # E2E tests
```

## Important Notes
- All tests must pass before committing
- Coverage thresholds are set to 100%
- Use MongoDB Memory Server for testing
- Cypress tests run against the full application