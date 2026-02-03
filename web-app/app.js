// Student Management Dashboard - Consolidated App
// Features: Add Students, Search, Theme Toggle, Advanced Filters

const STORAGE_KEY = "students_v1";
const THEME_KEY = "theme_v1";

const $ = (id) => document.getElementById(id);

let students = loadStudents();

// Add sample data if no data exists
if (students.length === 0) {
  students = [
    // Data from current session
    { id: "333333333", name: "33333", className: "3333", score: 3.0, createdAt: Date.now() - 86400000 },
    { id: "666666666", name: "66666", className: "6666666", score: 6.0, createdAt: Date.now() - 86300000 },
    // Additional sample data
    { id: "SV001", name: "Nguyễn Văn Tâm", className: "D21CQCN01", score: 8.5, createdAt: Date.now() - 86200000 },
    { id: "SV002", name: "Trần Thị Hoa", className: "D21CQCN02", score: 9.0, createdAt: Date.now() - 86100000 },
    { id: "SV003", name: "Lê Minh Thiện", className: "D21CQCN01", score: 7.8, createdAt: Date.now() - 86000000 },
    { id: "SV004", name: "Phạm Thu Hương", className: "D21CQCN03", score: 8.2, createdAt: Date.now() - 85900000 },
    { id: "SV005", name: "Võ Đức Quân", className: "D21CQCN02", score: 8.9, createdAt: Date.now() - 85800000 },
    { id: "SV006", name: "Ngô Minh Quỳnh", className: "D21CQCN01", score: 7.5, createdAt: Date.now() - 85700000 },
    { id: "SV007", name: "Bùi Thị Phước", className: "D21CQCN03", score: 9.2, createdAt: Date.now() - 85600000 },
    { id: "SV008", name: "Trương Văn An", className: "D21CQCN02", score: 8.0, createdAt: Date.now() - 85500000 },
    { id: "SV009", name: "Hoàng Thị Lan", className: "D21CQCN01", score: 8.7, createdAt: Date.now() - 85400000 },
    { id: "SV010", name: "Phan Đức Hải", className: "D21CQCN03", score: 7.3, createdAt: Date.now() - 85300000 },
    { id: "SV011", name: "Nguyễn Thị Mai", className: "D21CQCN02", score: 9.5, createdAt: Date.now() - 85200000 },
    { id: "SV012", name: "Lê Văn Nam", className: "D21CQCN01", score: 6.8, createdAt: Date.now() - 85100000 }
  ];
  
  // Save to localStorage immediately
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  console.log('📊 Sample data initialized and saved:', students.length, 'students');
}

// ===================
// CORE FUNCTIONS
// ===================

function loadStudents() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && stored.length > 0) {
      return stored;
    }
  } catch {
    // Fall through to sample data
  }
  
  // Return empty array - sample data will be added separately
  return [];
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function normalize(s) {
  return String(s ?? "").trim().toLowerCase();
}

function validateStudent(st) {
  if (!st.id || !st.name || !st.className) return "Vui lòng nhập đủ Mã SV, Họ tên, Lớp.";
  if (Number.isNaN(st.score) || st.score < 0 || st.score > 10) return "Điểm phải nằm trong [0, 10].";
  if (students.some((x) => x.id === st.id)) return "Mã SV đã tồn tại.";
  return "";
}

function render(list = students, searchQuery = '') {
  const tbody = $("studentTbody");
  const noResults = $("noResults");
  const searchTerm = $("searchTerm");
  
  tbody.innerHTML = "";
  
  if (list.length === 0 && searchQuery) {
    noResults.style.display = 'block';
    if (searchTerm) searchTerm.textContent = searchQuery;
    return;
  }
  
  noResults.style.display = 'none';
  
  for (const st of list) {
    const tr = document.createElement("tr");
    
    // Highlight search terms if provided
    const highlightText = (text, query) => {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark class="highlight">$1</mark>');
    };
    
    tr.innerHTML = `
      <td>${searchQuery ? highlightText(st.id, searchQuery) : st.id}</td>
      <td>${searchQuery ? highlightText(st.name, searchQuery) : st.name}</td>
      <td>${searchQuery ? highlightText(st.className, searchQuery) : st.className}</td>
      <td>${st.score.toFixed(1)}</td>
    `;
    tbody.appendChild(tr);
  }
}

// ===================
// ADD STUDENT FORM
// ===================

function setupAddForm() {
  const form = $("studentForm");
  const errorEl = $("formError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const st = {
      id: normalize($("studentId").value).toUpperCase(),
      name: $("studentName").value.trim(),
      className: $("studentClass").value.trim(),
      score: Number($("studentScore").value),
      createdAt: Date.now(),
    };

    const err = validateStudent(st);
    if (err) {
      errorEl.textContent = err;
      return;
    }

    students.push(st);
    saveStudents();
    form.reset();
    
    // Update search data if available
    if (window.studentSearch) {
      window.studentSearch.updateStudentData(students);
    } else {
      render();
    }
  });
}

// ===================
// SEARCH FUNCTIONALITY - by Tâm
// ===================

function setupSearch() {
  const input = $("searchInput");
  const clear = $("clearSearch");
  const searchStats = $("searchStats");
  
  // Current filter state
  let currentFilter = 'all';
  let filteredStudents = [...students];

  // Normalize text for Vietnamese search  
  function normalizeText(text) {
    return String(text || '').toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Filter students based on search query and filter type
  function filterStudents(searchQuery, filterType = 'all') {
    if (!searchQuery.trim()) return students;
    
    const normalizedQuery = normalizeText(searchQuery);
    return students.filter(student => {
      switch(filterType) {
        case 'id':
          return normalizeText(student.id).includes(normalizedQuery);
        case 'name':
          return normalizeText(student.name).includes(normalizedQuery);
        case 'class':
          return normalizeText(student.className).includes(normalizedQuery);
        case 'all':
        default:
          return normalizeText(student.id).includes(normalizedQuery) ||
                 normalizeText(student.name).includes(normalizedQuery) ||
                 normalizeText(student.className).includes(normalizedQuery);
      }
    });
  }

  // Update search statistics
  function updateSearchStats(totalResults, searchQuery, filterType = 'all') {
    if (!searchStats) return;
    
    let filterText = '';
    switch(filterType) {
      case 'id': filterText = ' (tìm theo mã SV)'; break;
      case 'name': filterText = ' (tìm theo họ tên)'; break;  
      case 'class': filterText = ' (tìm theo lớp)'; break;
      default: filterText = '';
    }

    if (searchQuery.trim()) {
      searchStats.textContent = `Tìm thấy ${totalResults} sinh viên cho "${searchQuery}"${filterText}`;
    } else {
      searchStats.textContent = `Hiển thị tất cả ${totalResults} sinh viên`;
    }
  }

  // Perform search and update UI
  function performSearch() {
    const searchQuery = input.value;
    filteredStudents = filterStudents(searchQuery, currentFilter);
    
    render(filteredStudents, searchQuery);
    updateSearchStats(filteredStudents.length, searchQuery, currentFilter);
    
    // Dispatch event for search history
    if (searchQuery.length >= 2) {
      document.dispatchEvent(new CustomEvent('studentSearchPerformed', {
        detail: { searchQuery: searchQuery }
      }));
    }
  }

  // Setup input events
  if (input) {
    input.addEventListener("input", performSearch);
  }
  
  if (clear) {
    clear.addEventListener("click", () => {
      input.value = "";
      filteredStudents = [...students];
      render(filteredStudents);
      updateSearchStats(filteredStudents.length, '', currentFilter);
      input.focus();
    });
  }

  // Setup filter chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Update active filter
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      
      // Re-perform search with new filter
      performSearch();
    });
  });

  // Listen for advanced filters
  document.addEventListener('advancedFiltersChanged', (e) => {
    let filtered = [...filteredStudents];
    
    // Apply score range filter
    if (e.detail.minScore !== null || e.detail.maxScore !== null) {
      filtered = filterByScoreRange(filtered, e.detail.minScore, e.detail.maxScore);
    }
    
    // Apply sorting
    if (e.detail.sortBy) {
      filtered = sortStudents(filtered, e.detail.sortBy);
    }
    
    render(filtered, input.value);
    updateSearchStats(filtered.length, input.value, currentFilter);
  });

  // Initialize
  updateSearchStats(students.length, '', 'all');

  // Make search functions available globally
  window.studentSearch = {
    allStudents: students,
    getFilteredStudents: () => [...filteredStudents],
    updateStudentData: (newStudents) => {
      students = newStudents;
      performSearch();
    }
  };
}

// ===================
// ADVANCED SEARCH FEATURES - by Tâm (MR #2)
// ===================

// Search History Management
class SearchHistory {
  constructor() {
    this.history = this.loadHistory();
    this.setupHistoryEvents();
    this.renderHistory();
  }

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('search_history_v1')) || [];
    } catch {
      return [];
    }
  }

  saveHistory() {
    localStorage.setItem('search_history_v1', JSON.stringify(this.history));
  }

  addToHistory(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) return;
    
    const term = searchTerm.trim();
    this.history = this.history.filter(item => item.term !== term);
    
    this.history.unshift({
      term: term,
      timestamp: Date.now()
    });
    
    if (this.history.length > 10) {
      this.history = this.history.slice(0, 10);
    }
    
    this.saveHistory();
    this.renderHistory();
  }

  setupHistoryEvents() {
    const clearBtn = $('clearHistory');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Xóa toàn bộ lịch sử tìm kiếm?')) {
          this.history = [];
          this.saveHistory();
          this.renderHistory();
        }
      });
    }

    document.addEventListener('studentSearchPerformed', (e) => {
      if (e.detail && e.detail.searchQuery) {
        this.addToHistory(e.detail.searchQuery);
      }
    });
  }

  renderHistory() {
    const historyList = $('searchHistoryList');
    if (!historyList) return;

    if (this.history.length === 0) {
      historyList.innerHTML = '<span style="color: var(--muted); font-style: italic;">Chưa có lịch sử tìm kiếm</span>';
      return;
    }

    historyList.innerHTML = this.history.map(item => `
      <div class="history-item" data-term="${item.term}">
        ${item.term}
      </div>
    `).join('');

    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const searchInput = $('searchInput');
        if (searchInput) {
          searchInput.value = item.dataset.term;
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
  }
}

// Advanced Search Panel
function setupAdvancedSearch() {
  const toggleBtn = $('toggleAdvanced');
  const panel = $('advancedPanel');
  const applyBtn = $('applyFilters');
  const resetBtn = $('resetFilters');
  const exportBtn = $('exportResults');

  let isAdvancedOpen = true;

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      isAdvancedOpen = !isAdvancedOpen;
      panel.classList.toggle('collapsed', !isAdvancedOpen);
      toggleBtn.textContent = isAdvancedOpen ? 'Thu gọn' : 'Mở rộng';
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const minScore = $('minScore')?.value;
      const maxScore = $('maxScore')?.value;
      const sortBy = $('sortBy')?.value;

      if (minScore && maxScore && parseFloat(minScore) > parseFloat(maxScore)) {
        alert('Điểm tối thiểu không thể lớn hơn điểm tối đa!');
        return;
      }

      const filters = {
        minScore: minScore ? parseFloat(minScore) : null,
        maxScore: maxScore ? parseFloat(maxScore) : null,
        sortBy: sortBy || ''
      };

      document.dispatchEvent(new CustomEvent('advancedFiltersChanged', {
        detail: filters
      }));
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const minScoreEl = $('minScore');
      const maxScoreEl = $('maxScore');
      const sortByEl = $('sortBy');
      
      if (minScoreEl) minScoreEl.value = '';
      if (maxScoreEl) maxScoreEl.value = '';
      if (sortByEl) sortByEl.value = '';
      
      document.dispatchEvent(new CustomEvent('advancedFiltersChanged', {
        detail: { minScore: null, maxScore: null, sortBy: '' }
      }));
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportToCSV();
    });
  }
}

// Suggestions functionality
function setupSuggestions() {
  const searchInput = $('searchInput');
  const suggestionsEl = $('searchSuggestions');
  
  if (!searchInput || !suggestionsEl) return;

  let suggestionTimeout;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    clearTimeout(suggestionTimeout);
    
    if (query.length >= 2) {
      suggestionTimeout = setTimeout(() => {
        generateSuggestions(query);
        showSuggestions();
      }, 150);
    } else {
      hideSuggestions();
    }
  });

  function generateSuggestions(query) {
    const suggestions = new Map();
    const normalizedQuery = query.toLowerCase();

    students.forEach(student => {
      if (student.name.toLowerCase().includes(normalizedQuery)) {
        suggestions.set(student.name, { text: student.name, type: 'Họ tên' });
      }
      if (student.id.toLowerCase().includes(normalizedQuery)) {
        suggestions.set(student.id, { text: student.id, type: 'Mã SV' });
      }
      if (student.className.toLowerCase().includes(normalizedQuery)) {
        suggestions.set(student.className, { text: student.className, type: 'Lớp' });
      }
    });

    const suggestionList = Array.from(suggestions.values()).slice(0, 5);
    renderSuggestions(suggestionList);
  }

  function renderSuggestions(suggestions) {
    if (suggestions.length === 0) {
      suggestionsEl.innerHTML = '';
      return;
    }

    suggestionsEl.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-item" data-text="${suggestion.text}">
        <span class="suggestion-text">${suggestion.text}</span>
        <span class="suggestion-type">${suggestion.type}</span>
      </div>
    `).join('');

    suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        searchInput.value = item.dataset.text;
        searchInput.dispatchEvent(new Event('input'));
        hideSuggestions();
      });
    });
  }

  function showSuggestions() {
    suggestionsEl.style.display = 'block';
  }

  function hideSuggestions() {
    suggestionsEl.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      hideSuggestions();
    }
  });
}

// Helper functions for advanced search
function filterByScoreRange(students, minScore, maxScore) {
  return students.filter(student => {
    const score = parseFloat(student.score);
    if (isNaN(score)) return false;
    if (minScore !== null && score < minScore) return false;
    if (maxScore !== null && score > maxScore) return false;
    return true;
  });
}

function sortStudents(students, sortBy) {
  const sorted = [...students];
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' }));
    case 'score-asc':
      return sorted.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));
    case 'score-desc':
      return sorted.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    case 'id-asc':
      return sorted.sort((a, b) => a.id.localeCompare(b.id));
    default:
      return sorted;
  }
}

function exportToCSV() {
  const filteredStudents = window.studentSearch?.getFilteredStudents() || [];
  
  if (filteredStudents.length === 0) {
    alert('Không có dữ liệu để export!');
    return;
  }

  try {
    const headers = ['Mã SV', 'Họ tên', 'Lớp', 'Điểm'];
    const csvRows = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.id,
        `"${student.name.replace(/"/g, '""')}"`,
        student.className || '',
        student.score.toFixed(1)
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `students-search-results-${timestamp}.csv`;
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`📄 Exported ${filteredStudents.length} students to ${filename}`);
    
  } catch (error) {
    console.error('Export error:', error);
    alert('Có lỗi xảy ra khi export file. Vui lòng thử lại!');
  }
}

// ===================
// THEME TOGGLE
// ===================

function applyTheme(theme) {
  if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
}

function setupTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(saved);

  $("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

// ===================
// INITIALIZATION
// ===================

// Initialize all features
setupAddForm();
setupSearch();
setupAdvancedSearch();
setupSuggestions();
setupTheme();

// Initialize search history
window.searchHistory = new SearchHistory();

render();

console.log('🚀 Student Management Dashboard initialized');
console.log('📊 Features: Add Students, Search (by Tâm), Theme Toggle, Advanced Filters');
console.log('💾 Data stored in localStorage with key:', STORAGE_KEY);