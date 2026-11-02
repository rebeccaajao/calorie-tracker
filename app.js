/**
 * NutriTrack - Vanilla Calorie & Macro Tracker
 * Pure Vanilla JavaScript (No Frameworks, No Libraries)
 * Persistent Storage via LocalStorage
 */

(function () {
  'use strict';

  // --- LocalStorage Keys ---
  const STORAGE_KEYS = {
    DAYS: 'nutritrack_days_v1',
    GOALS: 'nutritrack_goals_v1',
    CUSTOM_FOODS: 'nutritrack_custom_foods_v1'
  };

  // --- Default Daily Goals ---
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65,
    water: 8 // glasses (250ml each = 2000ml)
  };

  // --- Built-in Healthy Staples Catalog ---
  const STAPLE_FOODS = [
    { id: 'staple_1', name: 'Boiled Egg (Large)', serving: '1 egg (50g)', calories: 74, protein: 6.3, carbs: 0.4, fat: 5.0, category: 'staples' },
    { id: 'staple_2', name: 'Scrambled Eggs (2 Large)', serving: '2 eggs (100g)', calories: 182, protein: 12.2, carbs: 1.4, fat: 13.5, category: 'staples' },
    { id: 'staple_3', name: 'Chicken Breast (Grilled)', serving: '150g cooked', calories: 248, protein: 46.5, carbs: 0, fat: 5.4, category: 'staples' },
    { id: 'staple_4', name: 'Salmon Fillet (Baked)', serving: '150g fillet', calories: 310, protein: 34.0, carbs: 0, fat: 18.0, category: 'staples' },
    { id: 'staple_5', name: 'Canned Tuna in Water', serving: '1 can drained (120g)', calories: 132, protein: 29.0, carbs: 0, fat: 1.2, category: 'staples' },
    { id: 'staple_6', name: 'Rolled Oats (Dry)', serving: '40g (1/2 cup)', calories: 150, protein: 5.0, carbs: 27.0, fat: 2.5, category: 'staples' },
    { id: 'staple_7', name: 'Cooked White Rice', serving: '1 cup (158g)', calories: 205, protein: 4.2, carbs: 44.5, fat: 0.4, category: 'staples' },
    { id: 'staple_8', name: 'Cooked Brown Rice', serving: '1 cup (195g)', calories: 216, protein: 5.0, carbs: 45.0, fat: 1.8, category: 'staples' },
    { id: 'staple_9', name: 'Baked Sweet Potato', serving: '1 medium (130g)', calories: 115, protein: 2.0, carbs: 27.0, fat: 0.2, category: 'staples' },
    { id: 'staple_10', name: 'Whole Wheat Bread', serving: '2 slices (64g)', calories: 160, protein: 8.0, carbs: 26.0, fat: 2.0, category: 'staples' },
    { id: 'staple_11', name: 'Greek Yogurt (0% Fat)', serving: '1 cup (200g)', calories: 120, protein: 20.0, carbs: 7.0, fat: 0.8, category: 'staples' },
    { id: 'staple_12', name: 'Whey Protein Scoop', serving: '1 scoop (30g)', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, category: 'staples' },
    { id: 'staple_13', name: 'Banana', serving: '1 medium (118g)', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3, category: 'staples' },
    { id: 'staple_14', name: 'Apple (Medium)', serving: '1 apple (182g)', calories: 95, protein: 0.5, carbs: 25.0, fat: 0.3, category: 'staples' },
    { id: 'staple_15', name: 'Avocado', serving: '1/2 medium (80g)', calories: 130, protein: 1.6, carbs: 7.0, fat: 11.7, category: 'staples' },
    { id: 'staple_16', name: 'Almonds', serving: '1 handful (28g)', calories: 164, protein: 6.0, carbs: 6.1, fat: 14.2, category: 'staples' },
    { id: 'staple_17', name: 'Peanut Butter', serving: '2 tbsp (32g)', calories: 190, protein: 8.0, carbs: 7.0, fat: 16.0, category: 'staples' },
    { id: 'staple_18', name: 'Steamed Broccoli', serving: '1 cup (150g)', calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, category: 'staples' },
    { id: 'staple_19', name: 'Extra Virgin Olive Oil', serving: '1 tbsp (14g)', calories: 119, protein: 0, carbs: 0, fat: 13.5, category: 'staples' },
    { id: 'staple_20', name: 'Mixed Green Salad', serving: 'Large bowl (150g)', calories: 35, protein: 2.0, carbs: 6.0, fat: 0.5, category: 'staples' }
  ];

  // --- State ---
  let selectedDate = getTodayDateString();
  let dailyRecords = {};
  let userGoals = { ...DEFAULT_GOALS };
  let customFoods = [];
  let currentLibraryFilter = 'all-foods';
  let searchQuery = '';

  // --- Helper Date Functions ---
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateHuman(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const todayStr = getTodayDateString();

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formatted = dateObj.toLocaleDateString(undefined, options);

    if (dateStr === todayStr) {
      return `Today, ${formatted}`;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if (dateStr === yStr) {
      return `Yesterday, ${formatted}`;
    }

    return formatted;
  }

  function shiftDate(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- Storage Management ---
  function loadStorage() {
    try {
      const storedRecords = localStorage.getItem(STORAGE_KEYS.DAYS);
      if (storedRecords) {
        dailyRecords = JSON.parse(storedRecords);
      } else {
        dailyRecords = {};
      }

      const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (storedGoals) {
        userGoals = { ...DEFAULT_GOALS, ...JSON.parse(storedGoals) };
      }

      const storedFoods = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
      if (storedFoods) {
        customFoods = JSON.parse(storedFoods);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      showToast('Could not load stored data, defaults initialized', 'danger');
    }
  }

  function saveRecords() {
    try {
      localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(dailyRecords));
    } catch (e) {
      console.error('Error saving records', e);
      showToast('Storage limit exceeded or error saving data', 'danger');
    }
  }

  function saveGoals() {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(userGoals));
    } catch (e) {
      console.error('Error saving goals', e);
    }
  }

  function saveCustomFoods() {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(customFoods));
    } catch (e) {
      console.error('Error saving custom foods', e);
    }
  }

  // Ensure record structure exists for a given date
  function getOrCreateDayRecord(dateStr) {
    if (!dailyRecords[dateStr]) {
      dailyRecords[dateStr] = {
        date: dateStr,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        },
        exercises: [],
        waterGlasses: 0
      };
    }
    // Safety check for all fields
    if (!dailyRecords[dateStr].meals) {
      dailyRecords[dateStr].meals = { breakfast: [], lunch: [], dinner: [], snack: [] };
    }
    if (!dailyRecords[dateStr].exercises) {
      dailyRecords[dateStr].exercises = [];
    }
    if (typeof dailyRecords[dateStr].waterGlasses !== 'number') {
      dailyRecords[dateStr].waterGlasses = 0;
    }
    return dailyRecords[dateStr];
  }

  // --- UI Toast Notifications ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOutToast 0.3s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Calculations for Date ---
  function computeDayTotals(dateStr) {
    const record = getOrCreateDayRecord(dateStr);
    let totalFoodCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealCategories = ['breakfast', 'lunch', 'dinner', 'snack'];
    const mealTotals = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      snack: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };

    mealCategories.forEach(meal => {
      const items = record.meals[meal] || [];
      items.forEach(item => {
        const cal = Number(item.calories) || 0;
        const p = Number(item.protein) || 0;
        const c = Number(item.carbs) || 0;
        const f = Number(item.fat) || 0;

        totalFoodCalories += cal;
        totalProtein += p;
        totalCarbs += c;
        totalFat += f;

        mealTotals[meal].calories += cal;
        mealTotals[meal].protein += p;
        mealTotals[meal].carbs += c;
        mealTotals[meal].fat += f;
      });
    });

    let totalExerciseCalories = 0;
    (record.exercises || []).forEach(ex => {
      totalExerciseCalories += Number(ex.calories) || 0;
    });

    const netCalories = totalFoodCalories - totalExerciseCalories;
    const remainingCalories = userGoals.calories - netCalories;

    return {
      totalFoodCalories,
      totalExerciseCalories,
      netCalories,
      remainingCalories,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      mealTotals,
      waterGlasses: record.waterGlasses || 0
    };
  }

  // --- Render Functions ---
  function renderAll() {
    renderDateControls();
    renderDailyDashboard();
    renderMeals();
    renderExercises();
    renderWaterWidget();
    render7DayAnalytics();
    renderFoodCatalog();
    renderSettings();
  }

  function renderDateControls() {
    const dateInput = document.getElementById('currentDateInput');
    const dateText = document.getElementById('formattedDateText');
    if (dateInput) dateInput.value = selectedDate;
    if (dateText) dateText.textContent = formatDateHuman(selectedDate);
  }

  function renderDailyDashboard() {
    const stats = computeDayTotals(selectedDate);

    // Goal & Equation Values
    const statGoal = document.getElementById('statGoalKcal');
    const statFood = document.getElementById('statFoodKcal');
    const statBurned = document.getElementById('statBurnedKcal');
    const statNetRemaining = document.getElementById('statNetRemaining');

    if (statGoal) statGoal.textContent = userGoals.calories.toLocaleString();
    if (statFood) statFood.textContent = stats.totalFoodCalories.toLocaleString();
    if (statBurned) statBurned.textContent = stats.totalExerciseCalories.toLocaleString();

    if (statNetRemaining) {
      statNetRemaining.textContent = stats.remainingCalories.toLocaleString();
      if (stats.remainingCalories < 0) {
        statNetRemaining.className = 'eq-val font-red';
      } else {
        statNetRemaining.className = 'eq-val font-highlight';
      }
    }

    // Circular Ring
    const remainingValEl = document.getElementById('remainingCaloriesValue');
    const remainingLabelEl = document.getElementById('remainingCaloriesLabel');
    const ringProgressEl = document.getElementById('calorieRingProgress');
    const statusBadge = document.getElementById('calorieStatusBadge');

    const circumference = 2 * Math.PI * 74; // ~464.95

    if (stats.remainingCalories >= 0) {
      if (remainingValEl) remainingValEl.textContent = stats.remainingCalories.toLocaleString();
      if (remainingLabelEl) remainingLabelEl.textContent = 'kcal remaining';
      if (statusBadge) {
        statusBadge.textContent = 'On Track';
        statusBadge.className = 'status-badge badge-on-track';
      }
      if (ringProgressEl) {
        ringProgressEl.classList.remove('exceeded');
        const fraction = Math.min(stats.netCalories / Math.max(userGoals.calories, 1), 1);
        const offset = circumference * (1 - fraction);
        ringProgressEl.style.strokeDashoffset = offset;
      }
    } else {
      const overAmount = Math.abs(stats.remainingCalories);
      if (remainingValEl) remainingValEl.textContent = overAmount.toLocaleString();
      if (remainingLabelEl) remainingLabelEl.textContent = 'kcal over budget';
      if (statusBadge) {
        statusBadge.textContent = 'Over Target';
        statusBadge.className = 'status-badge badge-exceeded';
      }
      if (ringProgressEl) {
        ringProgressEl.classList.add('exceeded');
        ringProgressEl.style.strokeDashoffset = 0; // Full red ring
      }
    }

    // Macro Bars
    const curP = document.getElementById('currentProtein');
    const tarP = document.getElementById('targetProtein');
    const barP = document.getElementById('barProtein');
    if (curP) curP.textContent = `${stats.totalProtein}g`;
    if (tarP) tarP.textContent = `${userGoals.protein}g`;
    if (barP) {
      const pctP = Math.min((stats.totalProtein / Math.max(userGoals.protein, 1)) * 100, 100);
      barP.style.width = `${pctP}%`;
    }

    const curC = document.getElementById('currentCarbs');
    const tarC = document.getElementById('targetCarbs');
    const barC = document.getElementById('barCarbs');
    if (curC) curC.textContent = `${stats.totalCarbs}g`;
    if (tarC) tarC.textContent = `${userGoals.carbs}g`;
    if (barC) {
      const pctC = Math.min((stats.totalCarbs / Math.max(userGoals.carbs, 1)) * 100, 100);
      barC.style.width = `${pctC}%`;
    }

    const curF = document.getElementById('currentFat');
    const tarF = document.getElementById('targetFat');
    const barF = document.getElementById('barFat');
    if (curF) curF.textContent = `${stats.totalFat}g`;
    if (tarF) tarF.textContent = `${userGoals.fat}g`;
    if (barF) {
      const pctF = Math.min((stats.totalFat / Math.max(userGoals.fat, 1)) * 100, 100);
      barF.style.width = `${pctF}%`;
    }
  }

  function renderWaterWidget() {
    const record = getOrCreateDayRecord(selectedDate);
    const count = record.waterGlasses || 0;
    const target = userGoals.water || 8;

    const glassesCountEl = document.getElementById('waterGlassesCount');
    const glassesTargetEl = document.getElementById('waterGlassesTarget');
    const waterMlEl = document.getElementById('waterMlCount');
    const cupsGrid = document.getElementById('waterGlassesGrid');

    if (glassesCountEl) glassesCountEl.textContent = count;
    if (glassesTargetEl) glassesTargetEl.textContent = target;
    if (waterMlEl) waterMlEl.textContent = count * 250;

    if (!cupsGrid) return;
    cupsGrid.innerHTML = '';

    const displayCount = Math.max(count, target, 8);
    for (let i = 1; i <= displayCount; i++) {
      const cup = document.createElement('div');
      cup.className = `water-cup-icon ${i <= count ? 'filled' : ''}`;
      cup.title = `Glass ${i} (250ml)`;
      cup.textContent = i;
      cup.addEventListener('click', () => {
        // Toggle or set to this cup
        setWaterCount(i === count ? i - 1 : i);
      });
      cupsGrid.appendChild(cup);
    }
  }

  function setWaterCount(newCount) {
    const record = getOrCreateDayRecord(selectedDate);
    record.waterGlasses = Math.max(0, newCount);
    saveRecords();
    renderWaterWidget();
  }

  function renderMeals() {
    const record = getOrCreateDayRecord(selectedDate);
    const stats = computeDayTotals(selectedDate);
    const categories = ['breakfast', 'lunch', 'dinner', 'snack'];

    categories.forEach(cat => {
      const listEl = document.getElementById(`${cat}ItemsList`);
      const calBadge = document.getElementById(`${cat}CaloriesTotal`);
      const macroFooter = document.getElementById(`${cat}MacroFooter`);

      const mealStats = stats.mealTotals[cat];
      if (calBadge) {
        calBadge.textContent = `${mealStats.calories.toLocaleString()} kcal`;
      }
      if (macroFooter) {
        macroFooter.textContent = `P: ${Math.round(mealStats.protein * 10) / 10}g • C: ${Math.round(mealStats.carbs * 10) / 10}g • F: ${Math.round(mealStats.fat * 10) / 10}g`;
      }

      if (!listEl) return;
      const items = record.meals[cat] || [];

      if (items.length === 0) {
        listEl.innerHTML = `<div class="empty-state">No foods logged for ${cat.charAt(0).toUpperCase() + cat.slice(1)} yet.</div>`;
        return;
      }

      listEl.innerHTML = '';
      items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'food-row-item';

        const p = item.protein ? `<span class="macro-pill pill-p">P: ${item.protein}g</span>` : '';
        const c = item.carbs ? `<span class="macro-pill pill-c">C: ${item.carbs}g</span>` : '';
        const f = item.fat ? `<span class="macro-pill pill-f">F: ${item.fat}g</span>` : '';

        itemRow.innerHTML = `
          <div class="food-details">
            <span class="food-primary-title">${escapeHtml(item.name)}</span>
            <span class="food-serving-sub">${item.serving ? escapeHtml(item.serving) : 'Standard portion'}</span>
            <div class="food-macro-pills">${p} ${c} ${f}</div>
          </div>
          <div class="food-stats-right">
            <span class="food-calories-num">${Number(item.calories).toLocaleString()} kcal</span>
            <button type="button" class="item-delete-btn" title="Delete entry" data-meal="${cat}" data-id="${item.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        `;

        const deleteBtn = itemRow.querySelector('.item-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            deleteFoodItem(cat, item.id, item.name);
          });
        }

        listEl.appendChild(itemRow);
      });
    });
  }

  function renderExercises() {
    const record = getOrCreateDayRecord(selectedDate);
    const listEl = document.getElementById('exerciseItemsList');
    const badgeEl = document.getElementById('exerciseCaloriesTotal');

    const stats = computeDayTotals(selectedDate);
    if (badgeEl) {
      badgeEl.textContent = `-${stats.totalExerciseCalories.toLocaleString()} kcal`;
    }

    if (!listEl) return;
    const items = record.exercises || [];

    if (items.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No exercise logged for this day.</div>';
      return;
    }

    listEl.innerHTML = '';
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'food-row-item';
      const durationText = item.duration ? `${item.duration} mins` : 'Workout';

      row.innerHTML = `
        <div class="food-details">
          <span class="food-primary-title">🏃 ${escapeHtml(item.name)}</span>
          <span class="food-serving-sub">${escapeHtml(durationText)}</span>
        </div>
        <div class="food-stats-right">
          <span class="food-calories-num font-blue">-${Number(item.calories).toLocaleString()} kcal</span>
          <button type="button" class="item-delete-btn" title="Delete exercise" data-id="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      const deleteBtn = row.querySelector('.item-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          deleteExerciseItem(item.id, item.name);
        });
      }

      listEl.appendChild(row);
    });
  }

  function deleteFoodItem(mealCategory, id, name) {
    const record = getOrCreateDayRecord(selectedDate);
    record.meals[mealCategory] = record.meals[mealCategory].filter(i => i.id !== id);
    saveRecords();
    renderDailyDashboard();
    renderMeals();
    render7DayAnalytics();
    showToast(`Removed "${name}" from ${mealCategory}`, 'info');
  }

  function deleteExerciseItem(id, name) {
    const record = getOrCreateDayRecord(selectedDate);
    record.exercises = record.exercises.filter(i => i.id !== id);
    saveRecords();
    renderDailyDashboard();
    renderExercises();
    render7DayAnalytics();
    showToast(`Removed "${name}"`, 'info');
  }

  // --- 7-Day Analytics & Trends ---
  function render7DayAnalytics() {
    const svgEl = document.getElementById('weeklyChartSvg');
    const tableBody = document.getElementById('weeklyTableBody');
    if (!svgEl || !tableBody) return;

    // Build array of 7 consecutive dates ending on selectedDate
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(shiftDate(selectedDate, -i));
    }

    let sumCalories = 0;
    let sumProtein = 0;
    let sumCarbs = 0;
    let sumFat = 0;
    let onTargetCount = 0;

    tableBody.innerHTML = '';

    const chartData = dates.map(dateStr => {
      const stats = computeDayTotals(dateStr);
      sumCalories += stats.totalFoodCalories;
      sumProtein += stats.totalProtein;
      sumCarbs += stats.totalCarbs;
      sumFat += stats.totalFat;

      const withinTarget = stats.netCalories <= userGoals.calories;
      if (withinTarget && stats.totalFoodCalories > 0) {
        onTargetCount++;
      }

      // Add Row to History Table
      const tr = document.createElement('tr');
      const isSelected = dateStr === selectedDate;
      if (isSelected) {
        tr.style.backgroundColor = '#ecfdf5';
      }

      tr.innerHTML = `
        <td><strong>${escapeHtml(formatDateHuman(dateStr))}</strong> ${isSelected ? '<span class="status-badge badge-on-track" style="font-size: 0.65rem; padding: 2px 6px;">Active</span>' : ''}</td>
        <td><strong>${stats.totalFoodCalories.toLocaleString()}</strong> kcal</td>
        <td class="font-blue">${stats.totalExerciseCalories > 0 ? `-${stats.totalExerciseCalories.toLocaleString()}` : '0'} kcal</td>
        <td><strong>${stats.netCalories.toLocaleString()}</strong> kcal</td>
        <td>${stats.totalProtein}g</td>
        <td>${stats.totalCarbs}g</td>
        <td>${stats.totalFat}g</td>
        <td>
          ${stats.netCalories > userGoals.calories
            ? '<span class="status-badge badge-exceeded">Over Target</span>'
            : '<span class="status-badge badge-on-track">Within Goal</span>'
          }
        </td>
        <td>
          <button type="button" class="btn btn-sm btn-outline jump-date-btn" data-date="${dateStr}">View Day</button>
        </td>
      `;

      const jumpBtn = tr.querySelector('.jump-date-btn');
      if (jumpBtn) {
        jumpBtn.addEventListener('click', () => {
          selectedDate = dateStr;
          renderAll();
          // Switch tab to diary
          switchTab('diary-tab');
        });
      }

      tableBody.appendChild(tr);

      return {
        dateStr,
        foodCalories: stats.totalFoodCalories,
        netCalories: stats.netCalories,
        withinTarget
      };
    });

    // Populate Analytic Metric Cards
    const avgCalEl = document.getElementById('avg7DayCalories');
    const avgPEl = document.getElementById('avg7DayProtein');
    const avgCEl = document.getElementById('avg7DayCarbs');
    const avgFEl = document.getElementById('avg7DayFat');
    const adherenceEl = document.getElementById('adherenceRate');

    if (avgCalEl) avgCalEl.textContent = `${Math.round(sumCalories / 7).toLocaleString()} kcal`;
    if (avgPEl) avgPEl.textContent = `${Math.round((sumProtein / 7) * 10) / 10}g`;
    if (avgCEl) avgCEl.textContent = `${Math.round((sumCarbs / 7) * 10) / 10}g`;
    if (avgFEl) avgFEl.textContent = `${Math.round((sumFat / 7) * 10) / 10}g`;
    if (adherenceEl) adherenceEl.textContent = `${onTargetCount} / 7 days`;

    // Render SVG Bar Chart
    renderSvgBarChart(svgEl, chartData);
  }

  function renderSvgBarChart(svg, chartData) {
    const width = 650;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const maxFood = Math.max(...chartData.map(d => d.foodCalories), userGoals.calories, 100);
    const maxY = Math.ceil((maxFood * 1.15) / 500) * 500;

    const barGroupWidth = plotWidth / chartData.length;
    const barWidth = Math.min(38, barGroupWidth * 0.6);

    let svgInner = '';

    // Horizontal Grid Lines & Y-Axis labels
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const val = Math.round((maxY / steps) * i);
      const y = paddingTop + plotHeight - (val / maxY) * plotHeight;

      svgInner += `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />
        <text x="${paddingLeft - 8}" y="${y + 4}" fill="#94a3b8" font-size="11" text-anchor="end" font-weight="600">${val}</text>
      `;
    }

    // Goal Target Dashed Line
    const goalY = paddingTop + plotHeight - (userGoals.calories / maxY) * plotHeight;
    svgInner += `
      <line x1="${paddingLeft}" y1="${goalY}" x2="${width - paddingRight}" y2="${goalY}" stroke="#64748b" stroke-width="2" stroke-dasharray="5,4" />
      <text x="${width - paddingRight - 4}" y="${goalY - 6}" fill="#475569" font-size="11" font-weight="700" text-anchor="end">Goal: ${userGoals.calories} kcal</text>
    `;

    // Draw Bars
    chartData.forEach((d, idx) => {
      const xCenter = paddingLeft + idx * barGroupWidth + barGroupWidth / 2;
      const barX = xCenter - barWidth / 2;

      const barH = (d.foodCalories / maxY) * plotHeight;
      const barY = paddingTop + plotHeight - barH;

      const isCurrentActive = d.dateStr === selectedDate;
      const barFill = d.foodCalories > userGoals.calories ? '#e11d48' : '#059669';

      // Bar rectangle
      svgInner += `
        <rect x="${barX}" y="${barY}" width="${barWidth}" height="${Math.max(barH, 3)}" rx="5" ry="5" fill="${barFill}" opacity="${isCurrentActive ? '1' : '0.85'}">
          <title>${d.dateStr}: ${d.foodCalories} kcal</title>
        </rect>
      `;

      // Value label on top of bar
      if (d.foodCalories > 0) {
        svgInner += `
          <text x="${xCenter}" y="${barY - 6}" fill="#1e293b" font-size="11" font-weight="700" text-anchor="middle">${d.foodCalories}</text>
        `;
      }

      // X-axis day label
      const parts = d.dateStr.split('-');
      const shortDate = `${Number(parts[1])}/${Number(parts[2])}`;
      const [y, m, day] = parts.map(Number);
      const dayName = new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: 'narrow' });

      svgInner += `
        <text x="${xCenter}" y="${height - paddingBottom + 16}" fill="${isCurrentActive ? '#059669' : '#64748b'}" font-size="11" font-weight="${isCurrentActive ? '800' : '600'}" text-anchor="middle">${dayName} ${shortDate}</text>
      `;
    });

    svg.innerHTML = svgInner;
  }

  // --- Food Catalog & Custom Foods ---
  function getAllFoodsList() {
    return [...STAPLE_FOODS, ...customFoods];
  }

  function renderFoodCatalog() {
    const catalogContainer = document.getElementById('foodCatalogList');
    if (!catalogContainer) return;

    let foods = getAllFoodsList();

    // Tab filter
    if (currentLibraryFilter === 'custom-foods') {
      foods = customFoods;
    } else if (currentLibraryFilter === 'staples') {
      foods = STAPLE_FOODS;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      foods = foods.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.serving && f.serving.toLowerCase().includes(q))
      );
    }

    if (foods.length === 0) {
      catalogContainer.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No foods found matching your search.</div>';
      return;
    }

    catalogContainer.innerHTML = '';
    foods.forEach(food => {
      const card = document.createElement('div');
      card.className = 'catalog-food-card';

      const isCustom = !food.category || food.category === 'custom';

      card.innerHTML = `
        <div>
          <div class="catalog-food-title">${escapeHtml(food.name)}</div>
          <div class="catalog-food-serving">${escapeHtml(food.serving || '1 portion')}</div>
        </div>
        <div class="catalog-macros">
          <span class="macro-pill pill-p">P: ${food.protein || 0}g</span>
          <span class="macro-pill pill-c">C: ${food.carbs || 0}g</span>
          <span class="macro-pill pill-f">F: ${food.fat || 0}g</span>
        </div>
        <div class="catalog-card-footer">
          <span class="catalog-cal-val">${food.calories} kcal</span>
          <div style="display: flex; gap: 4px;">
            ${isCustom ? `
              <button type="button" class="item-delete-btn delete-custom-food-btn" title="Delete custom food" data-id="${food.id}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            ` : ''}
            <button type="button" class="btn btn-sm btn-primary quick-log-catalog-btn" title="Log this food to today's diary">
              + Log
            </button>
          </div>
        </div>
      `;

      // Quick log button
      const quickLogBtn = card.querySelector('.quick-log-catalog-btn');
      if (quickLogBtn) {
        quickLogBtn.addEventListener('click', () => {
          openFoodModalWithItem(food);
        });
      }

      // Delete custom food button
      const deleteCustomBtn = card.querySelector('.delete-custom-food-btn');
      if (deleteCustomBtn) {
        deleteCustomBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteCustomFood(food.id, food.name);
        });
      }

      catalogContainer.appendChild(card);
    });
  }

  function deleteCustomFood(id, name) {
    customFoods = customFoods.filter(f => f.id !== id);
    saveCustomFoods();
    renderFoodCatalog();
    showToast(`Removed "${name}" from custom foods`, 'info');
  }

  // --- Settings & Target Management ---
  function renderSettings() {
    const inputCal = document.getElementById('inputCalorieGoal');
    const inputP = document.getElementById('inputProteinGoal');
    const inputC = document.getElementById('inputCarbsGoal');
    const inputF = document.getElementById('inputFatGoal');
    const inputW = document.getElementById('inputWaterGoal');

    if (inputCal) inputCal.value = userGoals.calories;
    if (inputP) inputP.value = userGoals.protein;
    if (inputC) inputC.value = userGoals.carbs;
    if (inputF) inputF.value = userGoals.fat;
    if (inputW) inputW.value = userGoals.water;
  }

  // --- Modals Management ---
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function openFoodModalWithMeal(mealCategory) {
    const select = document.getElementById('foodMealSelect');
    if (select) select.value = mealCategory || 'breakfast';

    const form = document.getElementById('foodForm');
    if (form) form.reset();

    const editId = document.getElementById('foodEditId');
    if (editId) editId.value = '';

    const title = document.getElementById('foodModalTitle');
    if (title) title.textContent = `Log Food to ${mealCategory ? mealCategory.charAt(0).toUpperCase() + mealCategory.slice(1) : 'Diary'}`;

    openModal('foodModal');
  }

  function openFoodModalWithItem(item) {
    const form = document.getElementById('foodForm');
    if (form) form.reset();

    const nameInput = document.getElementById('foodNameInput');
    const servingInput = document.getElementById('foodServingInput');
    const calInput = document.getElementById('foodCaloriesInput');
    const pInput = document.getElementById('foodProteinInput');
    const cInput = document.getElementById('foodCarbsInput');
    const fInput = document.getElementById('foodFatInput');

    if (nameInput) nameInput.value = item.name || '';
    if (servingInput) servingInput.value = item.serving || '';
    if (calInput) calInput.value = item.calories || '';
    if (pInput) pInput.value = item.protein !== undefined ? item.protein : '';
    if (cInput) cInput.value = item.carbs !== undefined ? item.carbs : '';
    if (fInput) fInput.value = item.fat !== undefined ? item.fat : '';

    openModal('foodModal');
  }

  // --- Tab Switching ---
  function switchTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    if (tabId === 'analytics-tab') {
      render7DayAnalytics();
    } else if (tabId === 'library-tab') {
      renderFoodCatalog();
    }
  }

  // --- Sample Demo Data Loader ---
  function loadSampleData() {
    const today = getTodayDateString();
    const dMinus1 = shiftDate(today, -1);
    const dMinus2 = shiftDate(today, -2);
    const dMinus3 = shiftDate(today, -3);

    dailyRecords[dMinus3] = {
      date: dMinus3,
      meals: {
        breakfast: [
          { id: 'sb_1', name: 'Scrambled Eggs with Toast', serving: '2 eggs, 2 bread', calories: 342, protein: 20.2, carbs: 27.4, fat: 15.5 },
          { id: 'sb_2', name: 'Black Coffee', serving: '1 mug', calories: 5, protein: 0.3, carbs: 0, fat: 0 }
        ],
        lunch: [
          { id: 'sl_1', name: 'Grilled Chicken Rice Bowl', serving: '150g chicken, 1 cup rice', calories: 453, protein: 50.7, carbs: 44.5, fat: 5.8 }
        ],
        dinner: [
          { id: 'sd_1', name: 'Baked Salmon & Sweet Potato', serving: '150g salmon, 1 potato', calories: 425, protein: 36.0, carbs: 27.0, fat: 18.2 }
        ],
        snack: [
          { id: 'ss_1', name: 'Greek Yogurt with Blueberries', serving: '200g yogurt', calories: 165, protein: 20.5, carbs: 16.0, fat: 1.0 }
        ]
      },
      exercises: [
        { id: 'sex_1', name: 'Morning Jog', duration: 30, calories: 310 }
      ],
      waterGlasses: 8
    };

    dailyRecords[dMinus2] = {
      date: dMinus2,
      meals: {
        breakfast: [
          { id: 'sb_3', name: 'Rolled Oatmeal with Banana', serving: '50g oats, 1 banana', calories: 295, protein: 7.5, carbs: 60.0, fat: 3.5 }
        ],
        lunch: [
          { id: 'sl_2', name: 'Tuna Salad Sandwich', serving: '1 can tuna, whole wheat', calories: 390, protein: 37.0, carbs: 30.0, fat: 9.0 }
        ],
        dinner: [
          { id: 'sd_2', name: 'Lean Beef Stir Fry & Rice', serving: '150g beef, vegetables, rice', calories: 560, protein: 42.0, carbs: 55.0, fat: 14.0 }
        ],
        snack: [
          { id: 'ss_2', name: 'Whey Protein Shake', serving: '1 scoop with water', calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5 },
          { id: 'ss_3', name: 'Handful of Almonds', serving: '28g', calories: 164, protein: 6.0, carbs: 6.1, fat: 14.2 }
        ]
      },
      exercises: [
        { id: 'sex_2', name: 'Weightlifting Full Body', duration: 50, calories: 240 }
      ],
      waterGlasses: 7
    };

    dailyRecords[dMinus1] = {
      date: dMinus1,
      meals: {
        breakfast: [
          { id: 'sb_4', name: 'Avocado Toast with 2 Poached Eggs', serving: '2 eggs, avocado, toast', calories: 420, protein: 18.0, carbs: 32.0, fat: 23.0 }
        ],
        lunch: [
          { id: 'sl_3', name: 'Chicken Caesar Salad', serving: 'Large bowl', calories: 480, protein: 44.0, carbs: 12.0, fat: 28.0 }
        ],
        dinner: [
          { id: 'sd_3', name: 'Grilled Steak & Steamed Broccoli', serving: '200g steak, broccoli', calories: 510, protein: 48.0, carbs: 11.2, fat: 28.0 }
        ],
        snack: [
          { id: 'ss_4', name: 'Apple with Peanut Butter', serving: '1 apple, 1 tbsp peanut butter', calories: 190, protein: 4.5, carbs: 30.0, fat: 8.0 }
        ]
      },
      exercises: [
        { id: 'sex_3', name: 'Outdoor Cycling', duration: 45, calories: 320 }
      ],
      waterGlasses: 8
    };

    // Today's entry
    dailyRecords[today] = {
      date: today,
      meals: {
        breakfast: [
          { id: 'sb_5', name: 'Oatmeal & Whey Protein Bowl', serving: '40g oats, 1 scoop whey', calories: 270, protein: 29.0, carbs: 29.0, fat: 4.0 },
          { id: 'sb_6', name: 'Fresh Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27.0, fat: 0.3 }
        ],
        lunch: [
          { id: 'sl_4', name: 'Grilled Chicken Breast with White Rice & Broccoli', serving: '150g chicken, 1 cup rice', calories: 508, protein: 54.4, carbs: 55.7, fat: 6.4 }
        ],
        dinner: [],
        snack: [
          { id: 'ss_5', name: 'Greek Yogurt (0%)', serving: '170g', calories: 100, protein: 17.0, carbs: 6.0, fat: 0.7 }
        ]
      },
      exercises: [
        { id: 'sex_4', name: '30-minute Brisk Walk', duration: 30, calories: 140 }
      ],
      waterGlasses: 5
    };

    saveRecords();
    renderAll();
    showToast('Loaded demo records for the past 4 days!', 'success');
  }

  // --- Export & Import ---
  function exportData() {
    const exportPayload = {
      app: 'NutriTrack',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userGoals,
      customFoods,
      dailyRecords
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nutritrack-backup-${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Data exported successfully!', 'success');
  }

  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.dailyRecords && !parsed.userGoals) {
          throw new Error('Invalid file format. Missing NutriTrack records.');
        }

        if (parsed.userGoals) {
          userGoals = { ...DEFAULT_GOALS, ...parsed.userGoals };
          saveGoals();
        }

        if (Array.isArray(parsed.customFoods)) {
          customFoods = parsed.customFoods;
          saveCustomFoods();
        }

        if (parsed.dailyRecords && typeof parsed.dailyRecords === 'object') {
          dailyRecords = { ...dailyRecords, ...parsed.dailyRecords };
          saveRecords();
        }

        renderAll();
        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        console.error('Import error', err);
        showToast('Error importing file: Invalid JSON format', 'danger');
      }
    };
    reader.readAsText(file);
  }

  // --- Macro Presets Calculation ---
  function applyMacroPreset(splitType) {
    const cal = Number(document.getElementById('inputCalorieGoal').value) || userGoals.calories;

    let pPercent = 0.3;
    let cPercent = 0.45;
    let fPercent = 0.25;

    if (splitType === 'high-protein') {
      pPercent = 0.40;
      cPercent = 0.35;
      fPercent = 0.25;
    } else if (splitType === 'low-carb') {
      pPercent = 0.30;
      cPercent = 0.10;
      fPercent = 0.60;
    }

    // 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
    const pGrams = Math.round((cal * pPercent) / 4);
    const cGrams = Math.round((cal * cPercent) / 4);
    const fGrams = Math.round((cal * fPercent) / 9);

    document.getElementById('inputProteinGoal').value = pGrams;
    document.getElementById('inputCarbsGoal').value = cGrams;
    document.getElementById('inputFatGoal').value = fGrams;

    showToast(`Calculated ${splitType} macros: ${pGrams}g P, ${cGrams}g C, ${fGrams}g F`, 'info');
  }

  // --- Attach Event Listeners ---
  function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        switchTab(tabId);
      });
    });

    // Date Navigation
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const todayBtn = document.getElementById('todayBtn');
    const dateInput = document.getElementById('currentDateInput');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        selectedDate = shiftDate(selectedDate, -1);
        renderAll();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        selectedDate = shiftDate(selectedDate, 1);
        renderAll();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        selectedDate = getTodayDateString();
        renderAll();
      });
    }

    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
          selectedDate = e.target.value;
          renderAll();
        }
      });
    }

    // Water Buttons
    const addWaterBtn = document.getElementById('addWaterBtn');
    const removeWaterBtn = document.getElementById('removeWaterBtn');
    const resetWaterBtn = document.getElementById('resetWaterBtn');

    if (addWaterBtn) {
      addWaterBtn.addEventListener('click', () => {
        const record = getOrCreateDayRecord(selectedDate);
        setWaterCount((record.waterGlasses || 0) + 1);
      });
    }

    if (removeWaterBtn) {
      removeWaterBtn.addEventListener('click', () => {
        const record = getOrCreateDayRecord(selectedDate);
        setWaterCount(Math.max(0, (record.waterGlasses || 0) - 1));
      });
    }

    if (resetWaterBtn) {
      resetWaterBtn.addEventListener('click', () => {
        setWaterCount(0);
      });
    }

    // Modal Triggers
    const openAddFoodBtn = document.getElementById('openAddFoodModalBtn');
    if (openAddFoodBtn) {
      openAddFoodBtn.addEventListener('click', () => {
        openFoodModalWithMeal('breakfast');
      });
    }

    document.querySelectorAll('.quick-add-meal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const meal = btn.getAttribute('data-meal');
        openFoodModalWithMeal(meal);
      });
    });

    const openExerciseModalBtn = document.getElementById('openAddExerciseModalBtn');
    const quickAddExerciseBtn = document.getElementById('quickAddExerciseBtn');
    if (openExerciseModalBtn) {
      openExerciseModalBtn.addEventListener('click', () => openModal('exerciseModal'));
    }
    if (quickAddExerciseBtn) {
      quickAddExerciseBtn.addEventListener('click', () => openModal('exerciseModal'));
    }

    // Close Modals
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // Close modal on click backdrop
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay.id);
        }
      });
    });

    // Preset Chips in Food Modal
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('foodNameInput').value = chip.getAttribute('data-name') || '';
        document.getElementById('foodServingInput').value = chip.getAttribute('data-serving') || '';
        document.getElementById('foodCaloriesInput').value = chip.getAttribute('data-cal') || '';
        document.getElementById('foodProteinInput').value = chip.getAttribute('data-p') || '';
        document.getElementById('foodCarbsInput').value = chip.getAttribute('data-c') || '';
        document.getElementById('foodFatInput').value = chip.getAttribute('data-f') || '';
      });
    });

    // Preset Chips in Exercise Modal
    document.querySelectorAll('.preset-exercise-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('exerciseNameInput').value = chip.getAttribute('data-name') || '';
        document.getElementById('exerciseDurationInput').value = chip.getAttribute('data-dur') || '';
        document.getElementById('exerciseCaloriesInput').value = chip.getAttribute('data-cal') || '';
      });
    });

    // Food Form Submit
    const foodForm = document.getElementById('foodForm');
    if (foodForm) {
      foodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mealCategory = document.getElementById('foodMealSelect').value;
        const name = document.getElementById('foodNameInput').value.trim();
        const serving = document.getElementById('foodServingInput').value.trim();
        const calories = parseFloat(document.getElementById('foodCaloriesInput').value) || 0;
        const protein = parseFloat(document.getElementById('foodProteinInput').value) || 0;
        const carbs = parseFloat(document.getElementById('foodCarbsInput').value) || 0;
        const fat = parseFloat(document.getElementById('foodFatInput').value) || 0;
        const saveToCustom = document.getElementById('saveToCustomFoodsCheckbox').checked;

        const newItem = {
          id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name,
          serving,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const record = getOrCreateDayRecord(selectedDate);
        record.meals[mealCategory].push(newItem);
        saveRecords();

        if (saveToCustom) {
          const customItem = {
            id: 'custom_' + Date.now(),
            name,
            serving,
            calories: newItem.calories,
            protein: newItem.protein,
            carbs: newItem.carbs,
            fat: newItem.fat,
            category: 'custom'
          };
          customFoods.push(customItem);
          saveCustomFoods();
        }

        closeModal('foodModal');
        renderDailyDashboard();
        renderMeals();
        render7DayAnalytics();
        renderFoodCatalog();
        showToast(`Logged "${name}" to ${mealCategory.charAt(0).toUpperCase() + mealCategory.slice(1)}!`, 'success');
      });
    }

    // Exercise Form Submit
    const exerciseForm = document.getElementById('exerciseForm');
    if (exerciseForm) {
      exerciseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('exerciseNameInput').value.trim();
        const duration = parseFloat(document.getElementById('exerciseDurationInput').value) || 0;
        const calories = parseFloat(document.getElementById('exerciseCaloriesInput').value) || 0;

        const newExercise = {
          id: 'ex_' + Date.now(),
          name,
          duration: Math.round(duration),
          calories: Math.round(calories),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const record = getOrCreateDayRecord(selectedDate);
        record.exercises.push(newExercise);
        saveRecords();

        closeModal('exerciseModal');
        exerciseForm.reset();
        renderDailyDashboard();
        renderExercises();
        render7DayAnalytics();
        showToast(`Logged workout: ${name} (-${calories} kcal)!`, 'success');
      });
    }

    // Create Custom Food Form
    const createCustomFoodForm = document.getElementById('createCustomFoodForm');
    if (createCustomFoodForm) {
      createCustomFoodForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('customFoodName').value.trim();
        const serving = document.getElementById('customFoodServing').value.trim();
        const calories = parseFloat(document.getElementById('customFoodCalories').value) || 0;
        const protein = parseFloat(document.getElementById('customFoodProtein').value) || 0;
        const carbs = parseFloat(document.getElementById('customFoodCarbs').value) || 0;
        const fat = parseFloat(document.getElementById('customFoodFat').value) || 0;

        const customItem = {
          id: 'custom_' + Date.now(),
          name,
          serving,
          calories: Math.round(calories),
          protein: Math.round(protein * 10) / 10,
          carbs: Math.round(carbs * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          category: 'custom'
        };

        customFoods.push(customItem);
        saveCustomFoods();
        createCustomFoodForm.reset();
        renderFoodCatalog();
        showToast(`Saved "${name}" to your Food Library!`, 'success');
      });
    }

    // Food Catalog Subtabs & Search
    document.querySelectorAll('.food-subtab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.food-subtab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentLibraryFilter = tab.getAttribute('data-subtab');
        renderFoodCatalog();
      });
    });

    const foodSearchInput = document.getElementById('foodSearchInput');
    if (foodSearchInput) {
      foodSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderFoodCatalog();
      });
    }

    // Goals Form Submit
    const goalsForm = document.getElementById('goalsForm');
    if (goalsForm) {
      goalsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userGoals.calories = Math.round(parseFloat(document.getElementById('inputCalorieGoal').value)) || 2000;
        userGoals.protein = Math.round(parseFloat(document.getElementById('inputProteinGoal').value)) || 140;
        userGoals.carbs = Math.round(parseFloat(document.getElementById('inputCarbsGoal').value)) || 220;
        userGoals.fat = Math.round(parseFloat(document.getElementById('inputFatGoal').value)) || 65;
        userGoals.water = Math.round(parseFloat(document.getElementById('inputWaterGoal').value)) || 8;

        saveGoals();
        renderAll();
        showToast('Daily goals updated successfully!', 'success');
      });
    }

    // Macro Presets
    document.querySelectorAll('.preset-macro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const split = btn.getAttribute('data-split');
        applyMacroPreset(split);
      });
    });

    // Backup & Restore
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportData);
    }

    const triggerImportBtn = document.getElementById('triggerImportBtn');
    const importFileInput = document.getElementById('importFileInput');
    if (triggerImportBtn && importFileInput) {
      triggerImportBtn.addEventListener('click', () => {
        importFileInput.click();
      });
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleImportFile(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    const loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
    if (loadSampleDataBtn) {
      loadSampleDataBtn.addEventListener('click', () => {
        if (confirm('Load demo records for the past 4 days? Existing records for those days will be overwritten with sample meals.')) {
          loadSampleData();
        }
      });
    }

    const clearAllDataBtn = document.getElementById('clearAllDataBtn');
    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to completely erase all your records, custom foods, and diary entries? This cannot be undone.')) {
          localStorage.removeItem(STORAGE_KEYS.DAYS);
          localStorage.removeItem(STORAGE_KEYS.CUSTOM_FOODS);
          dailyRecords = {};
          customFoods = [];
          renderAll();
          showToast('All browser data cleared.', 'info');
        }
      });
    }
  }

  // --- Initialize App ---
  function init() {
    loadStorage();
    setupEventListeners();
    renderAll();
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

