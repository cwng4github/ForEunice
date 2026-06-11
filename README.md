# ForEunice - 嬰兒食瞓痾小助手 (Baby Tracker)

A Node.js Express web application for tracking baby feeding, sleeping, and diaper changes. This app helps parents predict and plan their baby's daily routine based on age-specific reference patterns and historical records.

## Features

- 📅 **Daily Planning**: View today's predicted schedule based on reference patterns
- 📝 **Record History**: Track feeding, sleep, and diaper changes with timestamps
- 📊 **Smart Forecasting**: Predict future schedules based on recent patterns
- 👶 **Age-Based Templates**: Automatic reference patterns for babies 0-12 months
- 💾 **Local Storage**: All data persists in browser localStorage
- 📤 **CSV Export**: Export all data for backup or analysis
- 🎨 **MUJI-Inspired Design**: Clean, minimalist Japanese aesthetic

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, Vanilla JavaScript
- **Styling**: Tailwind CSS, Custom CSS
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Noto Sans JP, Zen Maru Gothic)

## Project Structure

```
ForEunice-1/
├── public/
│   ├── css/
│   │   └── styles.css          # Custom styles
│   └── js/
│       └── app.js              # Client-side JavaScript
├── routes/
│   └── api.js                  # API routes
├── views/
│   └── index.ejs               # Main template
├── server.js                   # Express server
├── package.json                # Dependencies
└── README.md                   # This file
```

## Installation

1. **Clone the repository**:
   ```bash
   cd /Users/cwng/Documents/git/ForEunice-1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Usage

### Setting Up Baby Profile

1. Enter baby's birth date in the "BABY PROFILE" section
2. The app automatically loads age-appropriate reference patterns
3. You can manually adjust the reference pattern or reload it based on current age

### Recording Activities

1. Switch to the "RECORD" tab
2. Fill in date, time, and activity details (feeding, sleep, diaper)
3. Click "加入記錄" to save
4. View and edit records in the history list

### Viewing Forecasts

1. Switch to the "FORECAST" tab
2. Click "更新預測" to generate predictions based on recent history
3. The app calculates average time differences from the last 3 days
4. Click "保存今日預測" to save today's forecast

### Daily Planning

1. The "PLAN" tab shows today's schedule
2. Displays both predicted times and actual recorded activities
3. Click "重整今日計畫" to refresh the view

### Exporting Data

- Click the "匯出 CSV" button in the header to download all data as CSV

## API Endpoints

- `GET /` - Main application page
- `GET /api/health` - Health check endpoint
- `GET /api/data` - Get all baby data from cookies
- `POST /api/data` - Save baby data to cookies
- `GET /api/export/csv` - Export data as CSV file

## Data Storage

The application uses browser localStorage to persist data:
- `baby_birth_date` - Baby's birth date
- `baby_reference_pattern` - Reference feeding/sleep schedule
- `baby_history_records` - Historical activity records
- `baby_forecast_records` - Saved forecast predictions

## Age-Based Reference Patterns

The app includes pre-configured patterns for:
- **0 months**: Newborn (8 feedings/day, ~60-80ml)
- **1 month**: Every 3 hours (7-8 feedings, 80-100ml)
- **2 months**: Every 3-4 hours (6-7 feedings, 120ml)
- **3 months**: Every 3.5-4 hours (6 feedings, 130-150ml)
- **4-5 months**: Every 4 hours (5-6 feedings, 150-180ml)
- **6-7 months**: Starting solid foods (4 milk + 1-2 solids)
- **8-12 months**: Transitioning to solid meals (3 milk + solids)

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## Notes

- All reference patterns are for guidance only and not medical advice
- Data is stored locally in the browser
- The app is optimized for mobile devices (max-width: 480px)
- Supports Traditional Chinese (zh-Hant) language

## License

MIT

## Author

Created for Eunice 👶