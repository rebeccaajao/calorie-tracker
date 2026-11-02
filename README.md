# NutriTrack - Vanilla Calorie & Macro Tracker

A high-performance, responsive Calorie and Macronutrient Tracker built using **100% vanilla HTML, CSS, and JavaScript**.

- **No backend required**: Runs completely offline and client-side.
- **Zero CSS variables**: Hardcoded, reliable vanilla CSS rules.
- **Zero Tailwind or CSS Frameworks**: Custom responsive styles.
- **Zero JS Frameworks or Libraries**: Pure native DOM manipulation, native HTML5 APIs, and native SVG chart rendering.
- **Persistent Storage**: Saves all records, custom foods, and settings directly in the browser using `localStorage`.

---

## Features

1. **Daily Calorie & Macro Dashboard**:
   - Visual SVG circular progress ring showing consumed calories, remaining calories, and budget adherence.
   - Dynamic status badge (`On Track` / `Over Target`).
   - Calorie equation breakdown: `Target - Food + Burned = Net Remaining`.
   - Real-time macronutrient progress bars for Protein, Carbohydrates, and Fat.
   - Interactive water hydration tracker (250ml glass buttons and clickable cups).

2. **Categorized Meal Logging**:
   - **Breakfast, Lunch, Dinner, Snacks & Other**.
   - Subtotals for calories and macros per meal category.
   - Log food name, portion/serving size, calories, protein, carbs, and fat.
   - Quick one-click preset chips for common foods inside the modal.
   - Ability to delete logged entries with immediate real-time recalculated totals.

3. **Exercise & Burned Calories**:
   - Log workouts and activities with durations and calories burned.
   - Calories burned dynamically adjust your Net Remaining budget.

4. **Date Navigation**:
   - Seamlessly switch between dates using `Prev Day`, `Next Day`, `Today`, or the HTML5 date picker.
   - All logs, water intake, and workouts are organized persistently per date.

5. **7-Day Analytics & Trends**:
   - Pure Vanilla SVG bar chart showing the last 7 days of calorie intake against your daily goal line.
   - 7-day average metrics for calories, protein, carbs, and fat.
   - Goal adherence rate counter.
   - Interactive 7-day log table with a "View Day" button to jump directly to any past date.

6. **Food Library & Custom Creator**:
   - 20 pre-populated healthy staple foods (oats, eggs, chicken breast, salmon, rice, etc.).
   - Create and save custom foods to your persistent browser library.
   - Search filter to find foods instantly.
   - One-click "+ Log" button on any item to log it directly into your daily diary.

7. **Goals, Backup & Restore**:
   - Custom daily targets for calories, protein, carbs, fat, and water.
   - Macro auto-calculator presets (Balanced, High Protein, Low Carb/Keto).
   - **Export Data (JSON)**: Download your entire log history as a backup file.
   - **Import Data (JSON)**: Restore your data anytime.
   - **Load Sample Data**: One-click demo loader to test the app with realistic multi-day records.
   - **Clear All Data**: Factory reset with safety confirmation.

---

## How to Run

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. No build step, no npm, no dev server needed.

