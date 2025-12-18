# ALY Life - Features Documentation

## Overview
ALY Life is a comprehensive personal finance and note-taking mobile application built with Ionic and Angular. The app helps users manage their finances, take notes, and track various aspects of their daily life.

---

## 1. Authentication & User Management

### User Registration & Login
- **First-time setup**: Users can create their profile with name and avatar
- **Password protection**: Optional password protection for app access
- **Login authentication**: Password-based login for returning users
- **Auto-navigation**: Automatic routing based on authentication status

### User Profile Management
- **Profile editing**: Update user name
- **Avatar management**: 
  - Image picker integration
  - Image cropping functionality (250x250 target size)
  - Avatar display throughout the app
- **Password management**:
  - Set new password
  - Change existing password
  - Password confirmation validation
  - Old password verification for password changes

---

## 2. Home/Dashboard

### Personalized Experience
- **Time-based greetings**: 
  - Morning (5:00 - 12:00)
  - Afternoon (12:00 - 18:00)
  - Evening (18:00 - 22:00)
  - Night (22:00 - 5:00)
- **Inspirational quotes**: Random quotes from a collection of 102+ quotes displayed on home screen
- **Quick navigation**: Direct access to main features via bottom navigation

### Quick Access Features
- **Money preview**: Quick overview of financial status
- **Note tags**: Quick access to note categories (Family, Health, Life, Work, Study)
- **Version display**: App version shown on home screen (currently 0.8.3)

---

## 3. Finance Management (Money Module)

### Wallet Management

#### Wallet Types
The app supports 6 different wallet types:
1. **Tiền mặt (Cash)** - Physical cash
2. **Ngân hàng (Bank)** - Bank accounts
3. **Cổ phiếu (Stock)** - Stock investment portfolio
4. **Tiền tiết kiệm (Savings)** - Savings accounts
5. **Tài sản (Assets)** - Asset tracking
6. **Tín dụng (Credit)** - Credit cards

#### Wallet Features
- **Create wallets**: Add new wallets with custom names and types
- **Wallet details**: View wallet-specific information
- **Balance tracking**: Real-time balance updates
- **Transaction history**: Per-wallet transaction tracking
- **Stock wallet special features**:
  - Cash balance tracking
  - Investment value tracking
  - Gross balance calculation
  - Margin tracking
  - Profit/loss calculation

### Transaction Management

#### Income Categories
1. **Lương (Salary)** - Salary income
2. **Thưởng (Bonus)** - Bonus/rewards
3. **Tiền lãi (Interest)** - Interest earnings
4. **Quà (Gift)** - Gifts received
5. **Khác (Other)** - Other income sources

#### Expense Categories
1. **Ăn uống (Food & Dining)** - Food expenses
2. **Mua sắm (Shopping)** - Shopping expenses
3. **Học tập (Education)** - Education expenses
4. **Giải trí (Entertainment)** - Entertainment expenses
5. **Sức khỏe (Health)** - Health expenses
6. **Đi lại (Transportation)** - Transportation expenses
7. **Kinh doanh (Business)** - Business expenses
8. **Hóa đơn (Bills)** - Utility bills
9. **Tín dụng (Credit)** - Credit card payments
10. **Khác (Other)** - Other expenses

#### Transaction Features
- **Add transactions**: Record income or expenses with:
  - Amount
  - Category/tag
  - Wallet selection
  - Date
  - Details/notes
- **Edit transactions**: Modify existing transactions
- **Delete transactions**: Remove transactions with automatic balance recalculation
- **Transfer money**: Transfer funds between wallets with:
  - Source wallet selection
  - Destination wallet selection
  - Amount validation
  - Automatic balance updates
  - Special handling for credit card transfers
  - Stock wallet transfer logic (cash/investment value tracking)

### Financial Analytics & Reports

#### Overview Dashboard
- **Total balance**: Sum of all wallet balances (excluding credit)
- **Current loans**: Total credit/debt tracking
- **Monthly summary**: Income vs. expense totals
- **Chart visualization**: 
  - Line charts for balance over time
  - Pie charts for income breakdown
  - Pie charts for expense breakdown

#### History & Reports
- **Transaction history**: 
  - View by day
  - View by month
  - Date picker for specific date selection
  - Transaction details with category icons
- **Monthly analysis**: 
  - Income by category
  - Expenses by category
  - Total income/expense calculations
- **Bill management**: View and delete individual bills

### Budget Planning

#### Income Plans
- Set monthly income targets for each income category
- Default values: 1,000,000 VND per category
- Progress tracking against actual income
- Visual progress indicators

#### Expense Plans
- Set monthly expense limits for each expense category
- Default values: 100,000 VND per category
- Progress tracking against actual expenses
- Visual progress indicators
- Budget alerts (visual indicators when approaching/over budget)

#### Plan Management
- **View plans**: See all income and expense plans
- **Edit plans**: Update budget amounts using slider interface
- **Total calculations**: 
  - Total income plan
  - Total expense plan
- **Progress tracking**: Real-time comparison of actual vs. planned

### Stock Portfolio Management

#### Stock Features
- **Add stocks**: 
  - Stock code
  - Volume (number of shares)
  - Purchase price
  - Purchase date
  - Margin (if applicable)
- **Edit stocks**: Update stock information
- **Sell stocks**: Remove stocks from portfolio with automatic cash return
- **Portfolio tracking**:
  - Total portfolio value
  - Individual stock values
  - Cash balance in stock wallet
  - Investment value tracking
  - Margin tracking
  - Gross balance calculation
- **Validation**: Prevents buying stocks when insufficient cash available

### Credit Card Management
- **Credit tracking**: Track credit card balances and loans
- **Payment processing**: Handle credit card payments
- **Loan calculation**: Automatic loan balance updates
- **Transfer integration**: Special handling when transferring to/from credit cards

---

## 4. Note Taking Module

### Note Categories/Tags
The app provides 9 note categories:
1. **Chung (Common)** - General notes
2. **Drink** - Drink-related notes
3. **Bạn bè (Friends)** - Friend-related notes
4. **Học tập (Study)** - Study notes
5. **Công việc (Work)** - Work notes
6. **Cuộc sống (Life)** - Life notes
7. **Giải trí (Entertainment)** - Entertainment notes
8. **Gia đình (Family)** - Family notes
9. **Sức khỏe (Health)** - Health notes

### Note Features

#### Create Notes
- **Title**: Optional title (defaults to "Không Đề" if empty)
- **Content**: Main note content (required)
- **Tag selection**: Assign note to a category
- **Remarkable flag**: Mark notes as important/remarkable
- **Date stamping**: Automatic date/time assignment
- **Image support**: Notes can include images

#### View & Browse Notes
- **List view**: Display all notes in chronological order
- **Filter by tag**: View notes filtered by category
- **Filter by date**: View notes from a specific date
- **Show all**: Clear filters to show all notes
- **Note preview**: Quick preview of note content
- **Note detail**: Full note view with:
  - Title
  - Content
  - Date (day and month display)
  - Tag/category
  - Remarkable indicator

#### Edit Notes
- **Edit existing notes**: Modify title, content, tag, and remarkable status
- **Preserve metadata**: Maintain original date and ID
- **Tag change**: Update note category
- **Remarkable toggle**: Add/remove remarkable status

#### Delete Notes
- **Long press interaction**: Long press on note to reveal delete option
- **Shake animation**: Visual feedback when note is selected
- **Confirmation**: Delete confirmation dialog
- **Permanent deletion**: Remove note from storage

#### Note Interactions
- **Touch gestures**: Long press to edit/delete
- **Swipe actions**: Interactive note management
- **Animation effects**: Smooth animations for better UX

---

## 5. Health Module

### Clock Component
- **Analog clock**: Real-time analog clock display
- **Live updates**: Clock updates every second
- **Hour, minute, second hands**: Full clock functionality
- **CSS animations**: Smooth hand rotations

---

## 6. Settings Module

### User Settings
- **Profile management**: Access to user profile editing
- **Password settings**: Access to password management
- **Avatar update**: Quick access to change profile picture

### Navigation
- Direct links to:
  - User profile editing
  - Password management
  - Avatar update

---

## 7. About Page
- Information about the application
- Version details
- Developer information

---

## 8. Technical Features

### Data Storage
- **SQLite storage**: Local database using Ionic Storage
- **Offline-first**: All data stored locally
- **Data persistence**: Automatic data saving
- **Backup capability**: API endpoints for data backup (commented out in code)

### Charts & Visualization
- **Multiple chart libraries**:
  - Highcharts
  - Chart.js
  - AmCharts
- **Chart types**:
  - Line charts (balance over time)
  - Pie charts (income/expense breakdown)
  - Progress bars (budget tracking)

### Image Handling
- **Image picker**: Native image selection
- **Image cropping**: Built-in crop functionality
- **WebView conversion**: Proper image path handling for mobile

### Notifications
- **Local notifications**: Support for local notifications (plugin included)
- **Notification scheduling**: Ability to schedule notifications

### Platform Support
- **Android**: Full Android support
- **iOS**: Full iOS support
- **Cordova plugins**: Native device integration

### UI/UX Features
- **Material Design**: Angular Material components
- **Ionic components**: Native mobile UI components
- **Animations**: Smooth transitions and animations
- **Touch gestures**: Hammer.js integration for gestures
- **Responsive design**: Mobile-optimized interface
- **Custom fonts**: Multiple custom fonts (Baloo2, Dancing Script, IBM Plex Serif, Lobster, Noticia Text, Patrick Hand)

### Form Management
- **Reactive forms**: Angular reactive forms
- **Form validation**: Input validation
- **Error handling**: User-friendly error messages
- **Snackbar notifications**: Success/error feedback

### Routing & Navigation
- **Lazy loading**: Module-based lazy loading for performance
- **Route guards**: Authentication-based routing
- **Deep linking**: Support for deep navigation

---

## 9. Data Models

### User Model
- Name
- Age (optional)
- Address (optional)
- Avatar
- Bio (optional)
- Password (optional)
- Username (optional)

### Wallet Model
- ID
- Name
- Current balance
- Type
- Detail (optional)
- Transactions array
- Margin (for stocks)
- Not mine (for shared assets)
- Gross balance (for stocks)
- Loan (for credit cards)
- Cash (for stock wallet)
- Investment value (for stock wallet)

### Transaction Model
- Date ID
- Date filter
- Bill array
- Balance
- Income amount
- Outcome amount

### InOutcome Model (Bill)
- ID
- Date
- Wallet name
- Money amount
- Type (income/outcome)
- Tag/category
- Detail

### Note Model
- ID
- Title
- Content
- Date
- Tag
- Remark (boolean)
- Image

### Stock Model
- Code
- Value
- Volume
- Start price
- Start date
- Sell price (optional)
- Sell date (optional)
- Is holding (boolean)
- Margin (optional)

### Tag Plan Model
- ID
- Name
- Value
- Type (income/outcome)
- Icon

---

## 10. API Integration (Prepared but Commented)

The app has API endpoints prepared for:
- **User login**: Backend authentication
- **User creation**: User registration
- **Money data backup**: Backup wallet data to server
- **Money data retrieval**: Sync wallet data from server

(Currently using local storage only, API calls are commented out)

---

## Summary

ALY Life is a feature-rich personal finance and note-taking application with:
- **Comprehensive finance management** with multiple wallet types, transaction tracking, budgeting, and stock portfolio management
- **Flexible note-taking** with categorization, filtering, and organization features
- **User-friendly interface** with personalized greetings, quotes, and intuitive navigation
- **Offline-first architecture** with local SQLite storage
- **Mobile-optimized** for both Android and iOS platforms
- **Rich visualizations** with charts and progress indicators
- **Secure authentication** with password protection

The app provides a complete solution for managing personal finances and taking notes, all in one convenient mobile application.

