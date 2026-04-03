# Code Refactoring Guide

## Standardizing Style Variable Naming (Low Priority)

Current state: 23+ files use `const s = {}` for style objects

**Recommendation**: Standardize on `const styles = {}` or `const componentNameStyles = {}`

### Files to refactor (in priority order):
1. **Pages** (most visible to users):
   - [ ] frontend/src/pages/LoginPage.jsx
   - [ ] frontend/src/pages/RegisterPage.jsx
   - [ ] frontend/src/pages/HomePage.jsx
   - [ ] frontend/src/pages/ProfilePage.jsx
   - [ ] frontend/src/pages/SubjectsPage.jsx

2. **Layout Components** (widely reused):
   - [ ] frontend/src/components/layout/Sidebar.jsx
   - [ ] frontend/src/components/layout/Layout.jsx
   - [ ] frontend/src/components/layout/MobileHeader.jsx
   - [ ] frontend/src/components/layout/BottomNav.jsx

3. **Feature Components** (medium priority):
   - [ ] frontend/src/components/subjects/SubjectHero.jsx
   - [ ] frontend/src/components/subjects/SubjectCard.jsx
   - [ ] frontend/src/components/common/Modal.jsx

### Refactoring Steps:

For each file, perform:
1. Find: `const s = {` → Replace: `const styles = {`
2. Find: `style={s\\.` → Replace: `style={styles.`
3. Find: `labelStyle={s\\.` → Replace: `labelStyle={styles.`
4. Find: `style={{ \\.\\.\\. s\\.` → Replace: `style={{ ... styles.`

### Example (LoginPage):
```javascript
// Before
return (
  <div style={{ ...s.root, flexDirection: isMobile ? "column" : "row" }}>
    <FormField labelStyle={s.fieldLabel} inputStyle={s.fieldInput} />
  </div>
);
const s = { ... };

// After
return (
  <div style={{ ...styles.root, flexDirection: isMobile ? "column" : "row" }}>
    <FormField labelStyle={styles.fieldLabel} inputStyle={styles.fieldInput} />
  </div>
);
const styles = { ... };
```

### Automation:
Use VS Code Find and Replace (Ctrl+H) with regex patterns:
```
Find: \bs\.([a-zA-Z])
Replace: styles.$1
```

### Estimated Effort:
- Manual approach: ~2-3 hours total
- Automated approach: ~15-20 minutes

### Benefits:
- Improved code readability
- Better IDE autocomplete
- Clearer intent for future developers
- Follows JavaScript naming conventions
