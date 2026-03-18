# SocialSphere

## Current State
The backend is a Math Expo app with exponent problems. The frontend is a math practice UI. All of this needs to be replaced.

## Requested Changes (Diff)

### Add
- User profiles: username, bio, avatar (stored via blob-storage)
- Posts: text and/or photo, timestamp, authorId
- Follow/unfollow system between users
- Likes on posts
- Comments on posts
- Home feed: posts from followed users
- Explore feed: all public posts
- Landing/onboarding page for unauthenticated users

### Modify
- Replace entire backend with social media actor
- Replace entire frontend with social media UI

### Remove
- All math/exponent content and logic

## Implementation Plan
1. Select authorization and blob-storage components
2. Generate Motoko backend with profiles, posts, follows, likes, comments
3. Build React frontend: landing page, home feed, explore feed, post creation, profile pages, follow system
