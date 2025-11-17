# Phase 1: Database Connection & Campaign Viewing

## Overview
Phase 1 focuses on establishing the connection to the alihsan.org.au backend API, fetching campaign data, and displaying campaign information in the mobile app.

## Goals
- ✅ Connect mobile app to backend API
- ✅ Fetch list of campaigns from database
- ✅ Display campaigns in a list view
- ✅ View individual campaign details

---

## 1. Backend API Connection

### 1.1 API Configuration
**File:** `services/api.js`

**Tasks:**
- [x] Verify API base URL configuration (already exists)
- [ ] Update API URL to use production endpoint: `https://api.alihsan.org.au`
- [ ] Add environment-based URL switching (development/production)
- [ ] Test API connectivity

**Endpoints to Use:**
- `GET /project/all-projects` - Fetch all campaigns
- `GET /project/details/:slug` - Fetch campaign details by slug
- `GET /project/category` - Fetch campaign categories (optional for Phase 1)

---

## 2. Campaign List Implementation

### 2.1 Create Campaign List Screen
**File:** `app/(tabs)/campaigns.tsx` (new file)

**Tasks:**
- [ ] Create new tab screen for campaigns
- [ ] Implement FlatList or ScrollView to display campaigns
- [ ] Add pull-to-refresh functionality
- [ ] Display loading state while fetching
- [ ] Handle error states (network errors, empty list)

**Data to Display:**
- Campaign cover image
- Campaign name
- Campaign description (truncated)
- Campaign status/urgency indicators (if available)

### 2.2 Campaign Card Component
**File:** `components/CampaignCard.tsx` (new file)

**Tasks:**
- [ ] Create reusable campaign card component
- [ ] Display campaign image, title, and description
- [ ] Add touch handler to navigate to campaign details
- [ ] Style with consistent design system

---

## 3. Campaign Details Page

### 3.1 Create Campaign Details Screen
**File:** `app/campaign/[slug].tsx` (new file)

**Tasks:**
- [ ] Create dynamic route for campaign details using slug
- [ ] Fetch campaign details from API using slug parameter
- [ ] Display full campaign information:
  - Cover image
  - Title
  - Full description
  - Additional campaign metadata
- [ ] Add loading state
- [ ] Handle error states (campaign not found, network errors)

### 3.2 Update API Service
**File:** `services/api.js`

**Tasks:**
- [x] Verify `fetchCampaigns()` function exists (already implemented)
- [x] Verify `getCampaignDetails(slug)` function exists (already implemented)
- [ ] Test both functions with actual API calls
- [ ] Add error handling improvements if needed

---

## 4. Navigation Setup

### 4.1 Update Tab Navigation
**File:** `app/(tabs)/_layout.tsx`

**Tasks:**
- [ ] Add campaigns tab to navigation
- [ ] Configure tab icon and label
- [ ] Ensure proper navigation flow

### 4.2 Add Stack Navigation for Details
**File:** `app/_layout.tsx`

**Tasks:**
- [ ] Add campaign details route to stack navigator
- [ ] Configure navigation options (header, back button)

---

## 5. State Management

### 5.1 Campaign State
**Approach:** Use React hooks (useState, useEffect) for Phase 1

**Tasks:**
- [ ] Manage campaigns list state in campaigns screen
- [ ] Manage single campaign state in details screen
- [ ] Implement data fetching with useEffect
- [ ] Add loading and error states

**Future Consideration:** May need Context API or Redux for Phase 2+ when sharing state across screens

---

## 6. Error Handling & Loading States

### 6.1 Loading Components
**Tasks:**
- [ ] Create loading spinner component
- [ ] Show loading state during API calls
- [ ] Add skeleton loaders for better UX (optional)

### 6.2 Error Handling
**Tasks:**
- [ ] Display user-friendly error messages
- [ ] Add retry functionality for failed requests
- [ ] Handle network connectivity issues
- [ ] Log errors for debugging

---

## 7. Image Handling

### 7.1 Campaign Images
**Tasks:**
- [ ] Use `expo-image` for optimized image loading
- [ ] Add placeholder images for missing campaign covers
- [ ] Implement image caching
- [ ] Handle image load errors gracefully

---

## 8. Testing Checklist

### 8.1 Functionality Tests
- [ ] API connection successful
- [ ] Campaigns list loads correctly
- [ ] Pull-to-refresh works
- [ ] Navigation to campaign details works
- [ ] Campaign details page displays all information
- [ ] Back navigation works
- [ ] Error states display correctly
- [ ] Loading states display correctly

### 8.2 Edge Cases
- [ ] Empty campaigns list
- [ ] Network failure scenarios
- [ ] Invalid campaign slug
- [ ] Missing campaign images
- [ ] Slow network conditions

---

## File Structure

```
app/
├── _layout.tsx (update)
├── (tabs)/
│   ├── _layout.tsx (update)
│   ├── index.tsx
│   ├── campaigns.tsx (new)
│   └── explore.tsx
└── campaign/
    └── [slug].tsx (new)

components/
├── CampaignCard.tsx (new)
└── ... (existing components)

services/
└── api.js (update)
```

---

## Implementation Order

1. **Week 1: Setup & API Connection**
   - Update API configuration
   - Test API connectivity
   - Verify data structure from backend

2. **Week 2: Campaign List**
   - Create campaigns tab screen
   - Build CampaignCard component
   - Implement list view with data fetching

3. **Week 3: Campaign Details**
   - Create dynamic route for details
   - Build details screen
   - Implement navigation flow

4. **Week 4: Polish & Testing**
   - Add error handling
   - Improve loading states
   - Test all scenarios
   - Fix bugs

---

## Success Criteria

Phase 1 is complete when:
- ✅ Mobile app successfully connects to backend API
- ✅ Users can view a list of all campaigns
- ✅ Users can tap a campaign to view full details
- ✅ All error and loading states work correctly
- ✅ Navigation flow is smooth and intuitive

---

## Notes

- Keep implementation simple for Phase 1
- Focus on core functionality, not advanced features
- Use existing design patterns from the codebase
- Ensure consistent styling with existing components
- All API calls should go through `services/api.js`

