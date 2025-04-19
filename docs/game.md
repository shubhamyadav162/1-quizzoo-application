
# Quizzoo App - Technical Specification

## 1. Core Business Model

Quizzoo is a real-time competitive quiz platform where players can participate in contests to win prizes based on their knowledge and speed.

### 1.1 Game Mechanics

- **Contest Format**: 10 questions in 60 seconds (6 seconds per question)
- **Player Groups**: Varies from 1v1 to 50 players per contest
- **Question Display**: Each question appears for exactly 6 seconds, then auto-advances
- **Answer Submission**: Tap to select answer, auto-submitted when time expires
- **Scoring System**:
  - Primary: Correct answers (accuracy)
  - Secondary: Answer speed (tiebreaker)
- **Scoring Formula**: `Score = (Correct × 1000) + (6000 - Response Time in ms)`

### 1.2 Prize Distribution

- **Platform Fee**: 10% commission on all contest pools
- **Winner Allocation**:
  - 1st Place: 50% of remaining pool
  - 2nd Place: 30% of remaining pool
  - 3rd Place: 20% of remaining pool
- **Example**: 10 players × ₹10 = ₹100 pool → ₹10 platform fee → ₹45/₹27/₹18 to winners

## 2. Frontend Components

### 2.1 Home Screen

- **Featured Contests**: Carousel of upcoming premium contests
- **Quick Join**: Direct access to standard contest pools
- **Wallet Balance**: Prominently displayed with add-money button
- **User Stats**: Win ratio, contests played, rank
- **Navigation**: Contests, Profile, Leaderboards, Wallet

### 2.2 Contest Lobby

- **Pool Grid**: Minimum 30 contest pools displayed in grid format
- **Filtering Options**:
  - Entry fee range (₹10-₹1000)
  - Player count (1v1, 10, 20, 50)
  - Start time (Immediate, Scheduled)
  - Prize pool size

- **Pool Card Design**:
  - Entry fee badge
  - Prize pool amount with max potential
  - Player count with live updates
  - Countdown timer to start
  - Join button with entry fee
  - Visual indicator of pool fill status

- **Pool Categories**:
  - Standard pools (open to all)
  - Premium pools (higher entry fees)
  - Private/friend pools (invitation only)
  - Practice pools (free entry, no prizes)

### 2.3 Waiting Room

- **Player List**: Avatars and usernames of joined players
  - Animated joining effect for new players
  - Counter showing X/Y players joined
- **Contest Info**: Entry fee, prize breakdown, rules
- **Countdown Timer**: Time until contest begins
- **Chat Function**: Optional pre-game chat
- **Exit Option**: With refund policy timer (full refund if leaving >30s before start)

### 2.4 Game Screen

- **Header**:
  - Master timer (60-second countdown with progress bar)
  - Question counter (X/10)
  - Current score

- **Question Display**:
  - Question text (with optional image support)
  - 6-second timer ring animation
  - Four answer options in grid format
  - Visual feedback on selection
  - Transition animation between questions

- **Footer**:
  - Player name and avatar
  - Quick stats (correct/incorrect)

- **Transitions**:
  - Smooth animations between questions
  - "Time's up" animation if no answer selected
  - Brief feedback on selection (no correct answer shown)

### 2.5 Results Screen

- **Winner Podium**:
  - Animated reveal of top 3 players
  - Score and time breakdown
  - Prize amount with confetti effect

- **Personal Performance**:
  - Your position in the ranking
  - Score breakdown (correct answers & time)
  - Comparison to average

- **Question Analysis**:
  - Review of all questions with correct answers
  - Your answers with time taken
  - Performance statistics

- **Action Buttons**:
  - Play again
  - Share results
  - Return to lobby
  - Add to wallet (for winners)

### 2.6 Profile & History

- **User Profile**:
  - Username, avatar, stats
  - Achievement badges
  - Win history
  - Skill level indicator

- **Contest History**:
  - Filterable list of past contests
  - Performance metrics
  - Prize winnings
  - Replay option (view questions again)

### 2.7 Wallet & Transactions

- **Balance Section**:
  - Current balance
  - Add money button
  - Withdraw funds button

- **Transaction History**:
  - Date, amount, type (entry fee, prize, withdrawal, deposit)
  - Status (completed, pending, failed)
  - Downloadable receipts
  - GST information

- **KYC Integration**:
  - Identity verification status
  - Document upload interface
  - Verification progress tracker

## 3. User Flow & Experience

### 3.1 First-Time User Journey

1. **Onboarding**:
   - Username selection
   - Basic profile creation
   - Tutorial walkthrough (skippable)
   - Free practice contest

2. **First Contest Entry**:
   - Guided navigation to beginner-friendly contest
   - Clear explanation of entry fee and potential winnings
   - Secure payment flow
   - Pre-game tips

### 3.2 Regular User Flow

1. **App Launch → Home**
2. **Home → Contest Lobby**
3. **Contest Selection → Payment Confirmation**
4. **Payment → Waiting Room**
5. **Waiting Room → Game Screen**
6. **Game → Results Screen**
7. **Results → (Prize to Wallet) → Contest Lobby / Home**

### 3.3 Critical Interaction Points

- **Contest Join**: One-tap join with fingerprint/Face ID confirmation
- **Answer Selection**: Large tap targets, instant visual feedback
- **Result Reveal**: Engaging animation sequence
- **Prize Collection**: Automatic credit to wallet with celebration effect

## 4. Technical Requirements

### 4.1 Real-Time Functionality

- **Contest Synchronization**:
  - All players must see questions simultaneously
  - Answer submissions must be timestamped accurately
  - Results must be calculated in real-time

- **Latency Handling**:
  - Client-side prediction
  - Server-time synchronization
  - Fairness mechanisms for varying internet speeds

- **Disconnection Handling**:
  - Auto-rejoin capability
  - Score preservation
  - Partial refunds for major technical issues

### 4.2 Question Management

- **Question Database**:
  - 20,000+ questions with metadata
  - Categories, difficulty levels, and tags
  - Media support (images, potentially audio)

- **Question Selection Algorithm**:
  - Track questions seen by each user
  - Ensure no question repetition for individual users
  - Difficulty balancing across contests
  - Category distribution for varied experience

```
Algorithm Pseudo-code:
1. For each contest, create empty question set Q
2. For each participant p in contest:
   - Retrieve set S_p of all questions previously seen by p
3. Find candidate questions C = All questions - Union of S_p for all participants
4. If |C| >= 10:
   - Randomly select 10 questions from C considering difficulty distribution
5. Else:
   - Select |C| questions from C
   - Select (10 - |C|) questions from least recently seen questions
6. Store selected questions in contest record
7. Update each participant's seen question history after contest
```

### 4.3 Anti-Cheating Measures

- **Timing Verification**:
  - Server-side timestamp validation
  - Anomaly detection in answer patterns

- **Device Monitoring**:
  - Detect multiple accounts on same device
  - Prevent automated tools/bots

- **Behavioral Analysis**:
  - Sudden performance changes
  - Suspicious winning patterns
  - Response time consistency

### 4.4 UI/UX Requirements

- **Performance**:
  - <100ms response time for answer registration
  - Smooth 60fps animations
  - <2s load time for all screens

- **Accessibility**:
  - Minimum tap target size: 44×44 points
  - Color contrast compliance
  - Text scaling support

- **Responsive Design**:
  - Support all mobile screen sizes
  - Tablet optimization
  - Potential web interface

## 5. Contest Pool Matrix

### 5.1 Entry Fee Tiers

| Tier | Entry Fee | Player Count | Max Prize |
|------|-----------|--------------|-----------|
| Free | ₹0        | 10           | Practice  |
| Nano | ₹5        | 10           | ₹45       |
| Micro | ₹10      | 10           | ₹90       |
| Mini | ₹25       | 10           | ₹225      |
| Small | ₹50      | 10           | ₹450      |
| Medium | ₹100    | 20           | ₹1,800    |
| Large | ₹250     | 20           | ₹4,500    |
| XL   | ₹500      | 50           | ₹22,500   |
| XXL  | ₹1,000    | 50           | ₹45,000   |

### 5.2 Special Contest Formats

- **1v1 Duels**:
  - Direct matchmaking
  - 60-second format
  - Winner takes 90% of pool

- **Daily Jackpot**:
  - Scheduled prime-time contests
  - Higher entry fees
  - Guaranteed minimum prize pool

- **Tournament Mode**:
  - Multiple rounds
  - Progressive difficulty
  - Elimination format

## 6. Frontend Implementation Plan

### 6.1 Technology Stack

- **Framework**: React Native for cross-platform mobile app
- **State Management**: Redux/Context API
- **UI Components**: Custom component library with consistent design system
- **Navigation**: React Navigation
- **Animations**: React Native Reanimated + Lottie
- **Real-time Communication**: WebSockets (via Supabase Realtime)

### 6.2 Development Phases

#### Phase 1: Core Gameplay (4 weeks)
- Basic UI components and navigation
- Contest lobby with filtering
- Game screen with timers
- Simple results display
- Question rendering system

#### Phase 2: User Experience (3 weeks)
- Animations and transitions
- Enhanced results screen
- Profile and history views
- Waiting room experience
- Error handling and feedback

#### Phase 3: Advanced Features (3 weeks)
- Wallet and transactions
- Social features (friends, invites)
- Achievements and badges
- Advanced filtering and discovery
- Performance optimization

### 6.3 Testing Requirements

- **Performance Testing**:
  - Load testing with simulated users
  - Device testing across range of phones
  - Network condition simulation

- **User Testing**:
  - Gameplay smoothness
  - Intuitive navigation
  - Payment flow clarity
  - Results understanding

## 7. Monetization Strategy

### 7.1 Primary Revenue Stream

- 10% platform fee on all contest pools

### 7.2 Secondary Revenue Options

- **Premium Features**:
  - Statistics and analytics (₹49/month)
  - Advanced practice mode (₹99/month)
  - Ad-free experience (₹79/month)

- **Transaction Fees**:
  - Small withdrawal fee (₹5 or 2%)
  - Currency conversion fee (for international users)

- **Promotional Contests**:
  - Sponsored questions
  - Branded contests
  - Featured placement fees

## 8. Legal & Compliance

### 8.1 KYC Requirements

- Identity verification for withdrawals >₹10,000
- Age verification (18+ for paid contests)
- Document upload and verification process

### 8.2 Financial Compliance

- GST registration and invoicing
- Tax deduction at source (TDS) for winnings
- Proper record keeping for audit trail

### 8.3 Responsible Gaming

- Daily and monthly spending limits
- Self-exclusion options
- Educational content about responsible gaming

## 9. Future Expansion Possibilities

- **Educational Tracks**: Subject-specific learning contests
- **Corporate Edition**: Team-building and training
- **International Expansion**: Localization and currency support
- **AI Opponents**: Practice against computer players
- **Live Events**: Scheduled tournaments with commentators

---

This technical specification outlines the essential components and requirements for the Quizzoo app frontend development. The document will serve as a reference guide throughout the development process and can be updated as the project evolves.
