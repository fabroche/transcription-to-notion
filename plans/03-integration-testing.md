# Integration & Testing Plan - Notebook Query API

> **Status:** ⏳ PENDING - Backend Complete, Frontend Not Started
> **Version:** 1.0.0
> **Last Updated:** 2026-01-17

## Overview

This document outlines integration testing strategies for the NotebookLM Query API, covering backend-only testing (current), frontend-backend integration (when frontend is built), and end-to-end testing scenarios.

---

## Current State

| Component   | Status         | Testing Status |
| ----------- | -------------- | -------------- |
| Backend API | ✅ Complete    | ✅ Manual      |
| Frontend    | ⏳ Not Started | ⏳ Not Started |
| Integration | ⏳ Pending     | ⏳ Pending     |

---

## Testing Phases

### Phase 1: Backend Testing (✅ Current)

**Goal:** Verify backend API works correctly in isolation

**Scope:**
- API endpoints respond correctly
- MCP integration functions properly
- Error handling works as expected
- Validation catches invalid inputs

**Tools:**
- cURL
- Postman/Insomnia (optional)
- Manual testing

---

### Phase 2: Frontend Testing (⏳ When Frontend Built)

**Goal:** Verify frontend UI works correctly in isolation

**Scope:**
- Components render without errors
- User interactions work correctly
- Client-side validation functions
- Mock API responses work

**Tools:**
- React DevTools
- Browser console
- Manual UI testing

---

### Phase 3: Integration Testing (⏳ After Both Complete)

**Goal:** Verify frontend and backend work together seamlessly

**Scope:**
- Frontend calls backend correctly
- Backend responses render properly in UI
- Error states display correctly
- Full user workflows complete successfully

**Tools:**
- Both servers running simultaneously
- Browser + terminal
- Manual end-to-end testing

---

## Environment Setup

### Development Environment

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# ✅ Server running on port 3000
# ✅ Connected to NotebookLLM MCP
```

**Terminal 2 - Frontend (when ready):**

```bash
cd frontend
npm run dev
# Frontend running on port 5173
```

**Terminal 3 - Testing/Commands:**

```bash
# Use for curl commands, MCP auth, etc.
```

---

## Backend Testing (Current Phase)

### Prerequisites

1. **MCP Server Installed**

```bash
uv tool install notebooklm-mcp-server
# or
pip install notebooklm-mcp-server
```

2. **MCP Authenticated**

```bash
notebooklm-mcp-auth
# Opens Chrome, logs into Google, saves credentials to ~/.notebooklm-mcp/auth.json
```

3. **Backend Running**

```bash
cd backend
npm install
npm run dev
# Expected: "Server running on port 3000" + "Connected to NotebookLLM MCP"
```

---

### Test Suite: Backend API

#### Test 1: Health Checks ✅

**Purpose:** Verify services are running

```bash
# Notebook service health
curl http://localhost:3000/api/v1/notebook/health

# Expected Response:
# {
#   "success": true,
#   "message": "Notebook query service is running",
#   "timestamp": "2026-01-17T..."
# }

# Auth service health
curl http://localhost:3000/api/v1/auth/health

# Expected Response:
# {
#   "success": true,
#   "message": "Auth service is running",
#   "timestamp": "2026-01-17T..."
# }
```

**Success Criteria:**
- ✅ Both endpoints return 200 OK
- ✅ Response has correct structure
- ✅ Timestamp is current

---

#### Test 2: List Notebooks ✅

**Purpose:** Verify MCP connection and notebook retrieval

```bash
curl http://localhost:3000/api/v1/notebook/list
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "notebooks": [
      {
        "id": "abc123...",
        "title": "My Notebook",
        "url": "https://notebooklm.google.com/notebook/..."
      }
    ],
    "count": 1
  }
}
```

**Success Criteria:**
- ✅ Returns 200 OK
- ✅ Response contains `notebooks` array
- ✅ Each notebook has `id`, `title`, `url`
- ✅ `count` matches number of notebooks

**Common Errors:**

| Error                    | Cause                       | Solution                          |
| ------------------------ | --------------------------- | --------------------------------- |
| MCP connection failed    | MCP server not installed    | Install notebooklm-mcp-server     |
| Authentication expired   | Auth tokens expired         | Run `notebooklm-mcp-auth`         |
| Empty notebooks array    | No notebooks in account     | Create notebook in NotebookLM     |

---

#### Test 3: Query Notebook - Success ✅

**Purpose:** Verify end-to-end query flow

**Prerequisites:** At least one notebook exists (from Test 2)

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "notebookTitle": "My Notebook",
    "prompt": "What are the main topics discussed in this notebook?"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "answer": "The main topics include...",
    "notebookId": "abc123...",
    "notebookTitle": "My Notebook"
  }
}
```

**Success Criteria:**
- ✅ Returns 200 OK
- ✅ `answer` field is non-empty string
- ✅ `notebookId` matches notebook from list
- ✅ `notebookTitle` matches request

**Notes:**
- Response time varies based on notebook size (2-15 seconds typical)
- Answer quality depends on NotebookLM AI
- Title matching is case-insensitive

---

#### Test 4: Query Notebook - Notebook Not Found ✅

**Purpose:** Verify error handling for non-existent notebooks

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "notebookTitle": "NonExistentNotebook",
    "prompt": "This should fail because notebook does not exist"
  }'
```

**Expected Response:**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Notebook \"NonExistentNotebook\" not found. Available notebooks: My Notebook, Another Notebook"
}
```

**Success Criteria:**
- ✅ Returns 404 Not Found
- ✅ Error message includes notebook title
- ✅ Suggests available notebooks
- ✅ No crash or 500 error

---

#### Test 5: Validation - Missing Fields ✅

**Purpose:** Verify request validation

**Test 5.1: Missing notebookTitle**

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "This prompt is valid but no notebook title"
  }'
```

**Expected:** 400 Bad Request with validation error

**Test 5.2: Missing prompt**

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "notebookTitle": "My Notebook"
  }'
```

**Expected:** 400 Bad Request with validation error

**Test 5.3: Empty request body**

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** 400 Bad Request with multiple validation errors

**Success Criteria:**
- ✅ All return 400 Bad Request
- ✅ Error messages explain what's missing
- ✅ No server crash

---

#### Test 6: Validation - Field Constraints ✅

**Purpose:** Verify field length validation

**Test 6.1: Prompt too short (< 10 chars)**

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "notebookTitle": "My Notebook",
    "prompt": "Hi"
  }'
```

**Expected:** 400 Bad Request - "Prompt must be at least 10 characters"

**Test 6.2: Prompt too long (> 1000 chars)**

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d "{
    \"notebookTitle\": \"My Notebook\",
    \"prompt\": \"$(printf 'a%.0s' {1..1001})\"
  }"
```

**Expected:** 400 Bad Request - "Prompt cannot exceed 1000 characters"

**Test 6.3: Notebook title too long (> 200 chars)**

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d "{
    \"notebookTitle\": \"$(printf 'a%.0s' {1..201})\",
    \"prompt\": \"Valid prompt here with enough characters\"
  }"
```

**Expected:** 400 Bad Request - "Notebook title cannot exceed 200 characters"

**Success Criteria:**
- ✅ All constraints enforced
- ✅ Clear error messages
- ✅ No server errors

---

#### Test 7: Auth Reconnect ✅

**Purpose:** Verify auth reconnection without server restart

**Steps:**

1. Run MCP auth to refresh credentials:

```bash
notebooklm-mcp-auth
# Opens Chrome, logs in, saves new tokens
```

2. Reconnect backend to MCP:

```bash
curl -X POST http://localhost:3000/api/v1/auth/reconnect
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "MCP client reconnected successfully. New credentials loaded from auth.json"
  }
}
```

**Success Criteria:**
- ✅ Returns 200 OK
- ✅ Success message indicates reconnection
- ✅ Subsequent queries work without server restart

**Use Case:** When MCP auth tokens expire, reconnect without restarting backend

---

#### Test 8: CORS Configuration ✅

**Purpose:** Verify CORS allows frontend origin

**Test from browser console:**

```javascript
fetch('http://localhost:3000/api/v1/notebook/list')
  .then(r => r.json())
  .then(console.log)
```

**Run from:** `http://localhost:5173` (or configured CORS origin)

**Success Criteria:**
- ✅ No CORS errors in browser console
- ✅ Request completes successfully
- ✅ Response data received

**Common Error:**

```
Access to fetch at 'http://localhost:3000/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solution:** Verify `CORS_ORIGIN` in backend `.env` matches frontend URL

---

### Backend Testing Checklist

- [ ] Health checks return 200 OK
- [ ] List notebooks returns correct data structure
- [ ] Query notebook succeeds with valid input
- [ ] Notebook not found returns 404 with suggestions
- [ ] Missing fields return 400 with validation errors
- [ ] Field constraints enforced (min/max lengths)
- [ ] Auth reconnect works without restart
- [ ] CORS configured for frontend origin
- [ ] MCP connection stable
- [ ] Error messages are clear and helpful

---

## Frontend Testing (When Built)

### Prerequisites

1. Frontend project initialized
2. Dependencies installed
3. Environment variables configured
4. Backend running

### Test Suite: Frontend UI

#### Test 1: App Renders

- [ ] App loads without errors
- [ ] No console errors
- [ ] All components visible
- [ ] Styling applied correctly

#### Test 2: Notebook Selector

- [ ] Dropdown shows loading skeleton initially
- [ ] Notebooks load from backend
- [ ] Dropdown populated with notebook titles
- [ ] Selection updates state
- [ ] Error message shown if backend offline

#### Test 3: Query Input

- [ ] Textarea accepts input
- [ ] Character count updates
- [ ] Min/max length enforced
- [ ] Disabled state works during submission

#### Test 4: Form Validation

- [ ] Submit button disabled when form invalid
- [ ] Submit button enabled when form valid
- [ ] Client-side validation messages shown
- [ ] Form submission prevented when invalid

#### Test 5: Query Submission

- [ ] Submit button triggers API call
- [ ] Loading state shown during request
- [ ] Submit button disabled during request
- [ ] Form fields disabled during request

#### Test 6: Results Display

- [ ] Answer displayed after successful query
- [ ] Notebook title badge shown
- [ ] Answer text formatted correctly
- [ ] Card layout renders properly

#### Test 7: Error Handling

- [ ] Network errors shown in alert
- [ ] Validation errors shown in alert
- [ ] 404 errors shown with notebook suggestions
- [ ] Error alerts dismissible

#### Test 8: Auth Status

- [ ] Auth status badge visible
- [ ] Reconnect button clickable
- [ ] Loading state during reconnect
- [ ] Success message shown after reconnect
- [ ] Error message shown if reconnect fails

---

## Integration Testing (Backend + Frontend)

### Prerequisites

1. Backend running on `http://localhost:3000`
2. Frontend running on `http://localhost:5173`
3. MCP authenticated
4. At least one notebook exists in NotebookLM

---

### End-to-End Test Scenarios

#### E2E Test 1: Complete Happy Path

**User Story:** User selects notebook, enters query, sees answer

**Steps:**

1. Open `http://localhost:5173` in browser
2. Wait for notebook selector to load
3. Select a notebook from dropdown
4. Enter query: "What are the main topics?"
5. Click "Submit Query"
6. Wait for response (2-15 seconds)
7. Verify answer displays in card

**Success Criteria:**
- ✅ No errors in browser console
- ✅ No errors in backend console
- ✅ Answer displays correctly
- ✅ Notebook title badge shows correct notebook
- ✅ User can submit another query

---

#### E2E Test 2: Notebook Not Found

**User Story:** User enters title for non-existent notebook

**Steps:**

1. Open app
2. Select notebook from dropdown
3. Manually edit the request (browser DevTools) to change title
4. Submit query
5. Verify 404 error shown with suggestions

**Success Criteria:**
- ✅ Error alert displays
- ✅ Error message includes available notebooks
- ✅ User can retry with valid notebook

---

#### E2E Test 3: Backend Offline

**User Story:** User tries to use app when backend is down

**Steps:**

1. Stop backend server
2. Open app (or refresh)
3. Verify error message when loading notebooks
4. Try to submit query
5. Verify error message shown

**Success Criteria:**
- ✅ App doesn't crash
- ✅ Clear error messages shown
- ✅ User can retry when backend comes back online

---

#### E2E Test 4: Auth Expiration

**User Story:** User session expires, needs to reconnect

**Steps:**

1. Let MCP auth expire (or manually invalidate)
2. Try to query notebook
3. See auth error
4. Run `notebooklm-mcp-auth` in terminal
5. Click "Reconnect" button in UI
6. Retry query
7. Verify success

**Success Criteria:**
- ✅ Auth error detected
- ✅ Reconnect succeeds
- ✅ Subsequent queries work
- ✅ No server restart needed

---

#### E2E Test 5: Multiple Queries

**User Story:** User submits multiple queries to same/different notebooks

**Steps:**

1. Select notebook A
2. Submit query 1
3. View answer 1
4. Change to notebook B
5. Submit query 2
6. View answer 2
7. Return to notebook A
8. Submit query 3
9. View answer 3

**Success Criteria:**
- ✅ All queries complete successfully
- ✅ Answers display correctly
- ✅ No state pollution between queries
- ✅ Performance remains consistent

---

#### E2E Test 6: Validation Errors

**User Story:** User submits invalid input

**Test Cases:**

1. **No notebook selected + valid query**
   - Error: "Please select a notebook"

2. **Valid notebook + query too short**
   - Error: "Query must be at least 10 characters"

3. **No input at all**
   - Submit button disabled, can't submit

**Success Criteria:**
- ✅ All validation errors caught
- ✅ Clear error messages
- ✅ User can correct and retry

---

### Integration Testing Checklist

**Frontend-Backend Communication:**
- [ ] Frontend calls correct backend endpoints
- [ ] Request bodies formatted correctly
- [ ] Response data parsed correctly
- [ ] Error responses handled properly

**State Management:**
- [ ] Loading states synchronized with API calls
- [ ] Error states cleared on new requests
- [ ] Form state resets appropriately
- [ ] No state pollution between requests

**User Experience:**
- [ ] Loading indicators shown during API calls
- [ ] Error messages clear and actionable
- [ ] Success states visually distinct
- [ ] App responsive to user interactions

**Error Handling:**
- [ ] Network errors handled gracefully
- [ ] Server errors displayed to user
- [ ] Validation errors shown clearly
- [ ] App recovers from errors

**Performance:**
- [ ] Initial load time < 2 seconds
- [ ] Notebook list loads < 1 second
- [ ] Query responses in reasonable time
- [ ] No memory leaks or performance degradation

---

## Performance Testing

### Metrics to Monitor

**Backend:**
- Request latency (p50, p95, p99)
- Memory usage during queries
- CPU usage during MCP calls
- MCP connection stability

**Frontend:**
- Initial bundle size
- Time to interactive
- React render performance
- Memory usage

**Target Metrics:**

| Metric              | Target       | Acceptable | Poor    |
| ------------------- | ------------ | ---------- | ------- |
| List notebooks      | < 500ms      | < 1s       | > 2s    |
| Query (simple)      | 2-5s         | 5-10s      | > 15s   |
| Query (complex)     | 5-10s        | 10-15s     | > 20s   |
| Health check        | < 50ms       | < 100ms    | > 200ms |
| Auth reconnect      | < 1s         | < 2s       | > 5s    |
| Frontend load       | < 1s         | < 2s       | > 3s    |

---

## Security Testing

### Security Checklist

**Backend:**
- [ ] No credentials in logs
- [ ] Error messages don't leak sensitive info
- [ ] CORS properly configured
- [ ] Input validation prevents injection
- [ ] Rate limiting (planned for production)

**Frontend:**
- [ ] No API keys in client code
- [ ] User input sanitized before display
- [ ] HTTPS in production
- [ ] No sensitive data in localStorage

**MCP Authentication:**
- [ ] Credentials stored securely (`~/.notebooklm-mcp/auth.json`)
- [ ] Auth tokens not exposed in responses
- [ ] Reconnect requires user action
- [ ] No auto-reconnect on failure

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue: "Failed to connect to MCP"

**Symptoms:** Backend logs show MCP connection error on startup

**Solutions:**

1. Verify MCP server installed: `notebooklm-mcp-server --help`
2. Reinstall: `uv tool install notebooklm-mcp-server --force`
3. Check Python version: `python --version` (need >= 3.8)

---

#### Issue: "Authentication expired"

**Symptoms:** Queries fail with auth errors

**Solutions:**

1. Run `notebooklm-mcp-auth` to refresh
2. Call `/api/v1/auth/reconnect` (or click Reconnect in UI)
3. If still fails, restart backend

---

#### Issue: "Notebook not found"

**Symptoms:** 404 error when querying valid-looking notebook

**Solutions:**

1. List notebooks: `curl http://localhost:3000/api/v1/notebook/list`
2. Use exact title (case-insensitive but must match)
3. Verify notebook exists in NotebookLM web interface

---

#### Issue: CORS errors in browser

**Symptoms:** "blocked by CORS policy" in browser console

**Solutions:**

1. Check backend `.env`: `CORS_ORIGIN=http://localhost:5173`
2. Verify frontend URL matches CORS origin
3. Restart backend after changing .env

---

#### Issue: Slow query responses

**Symptoms:** Queries take > 15 seconds

**Causes:**
- Large notebook (many sources)
- Complex query
- NotebookLM API latency
- Network issues

**Solutions:**
- Simplify query
- Reduce notebook size
- Check network connection
- Increase timeout (if needed)

---

## Testing Tools & Resources

### Recommended Tools

**Backend Testing:**
- **cURL:** Command-line HTTP client (built-in)
- **Postman:** GUI for API testing (optional)
- **HTTPie:** User-friendly cURL alternative (optional)

**Frontend Testing:**
- **React DevTools:** Browser extension for React debugging
- **Browser DevTools:** Network, console, elements inspection
- **Lighthouse:** Performance auditing

**Integration Testing:**
- Manual testing (current approach)
- Playwright/Cypress (future: automated E2E)

### Sample Postman Collection

**Create collection with:**

1. **GET** `/api/v1/notebook/health`
2. **GET** `/api/v1/notebook/list`
3. **POST** `/api/v1/notebook/query`
   - Body: `{"notebookTitle": "My Notebook", "prompt": "Summarize"}`
4. **POST** `/api/v1/auth/reconnect`
5. **GET** `/api/v1/auth/health`

---

## Next Steps

### Short Term (Backend Complete)

- [x] Test all backend endpoints manually
- [x] Verify MCP integration
- [x] Document testing procedures
- [ ] Create Postman collection
- [ ] Add backend unit tests (Jest/Vitest)

### Medium Term (When Frontend Built)

- [ ] Build frontend per plan
- [ ] Test frontend UI components
- [ ] Test frontend-backend integration
- [ ] Run all E2E scenarios
- [ ] Fix integration issues

### Long Term (Production Prep)

- [ ] Add automated E2E tests (Playwright)
- [ ] Add performance monitoring
- [ ] Add error tracking (Sentry)
- [ ] Load testing
- [ ] Security audit

---

## Conclusion

This integration testing plan provides:

✅ Comprehensive backend testing procedures
✅ Frontend testing checklist (when ready)
✅ End-to-end test scenarios
✅ Performance metrics and targets
✅ Troubleshooting guide
✅ Security testing checklist

**Current Status:** Backend testing complete and documented. Frontend and integration testing pending frontend implementation.

**Next Step:** Build frontend, then execute integration testing phase.
