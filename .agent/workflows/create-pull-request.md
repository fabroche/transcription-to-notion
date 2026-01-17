---
description: Create commit and pull request with high-quality documentation
---

# Workflow: Create Commit and Pull Request

This workflow guides you through creating a professional commit and pull request with comprehensive documentation, following the same quality standards as PR #2.

## Prerequisites

- [ ] All code changes are complete and tested
- [ ] Server is running without errors
- [ ] All endpoints are verified working
- [ ] Lint errors are fixed

---

## Step 1: Review Changes

Check what files have been modified:

```bash
git status
```

Review the actual changes:

```bash
git diff
```

**Checklist:**

- [ ] All intended changes are present
- [ ] No unintended changes included
- [ ] No sensitive data or credentials in code

---

## Step 2: Stage Changes

Add all changes to staging:

```bash
git add -A
```

Verify staged changes:

```bash
git status
```

---

## Step 3: Create Commit Message

### Commit Message Format

```
<type>: <short description>

[BREAKING CHANGE: <breaking change description>]

<detailed description>

Changes:
- <change 1>
- <change 2>
- <change 3>

[Removed endpoints/features:]
- <removed item 1>
- <removed item 2>

[New endpoints/features:]
- <new item 1>
- <new item 2>

Files deleted: <number>
Files modified: <number>
Dependencies added/removed: <number>
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `test`: Test additions/changes
- `perf`: Performance improvements

### Example Commit

```bash
git commit -m "feat: add auth reconnect endpoint

Implemented authentication reconnect endpoint to reload MCP credentials
without server restart.

Changes:
- Created auth.service.ts with reconnect method
- Created auth.router.ts with POST /reconnect endpoint
- Added auth routes to main router
- Fixed lint errors (node: prefix for imports)

New endpoints:
- POST /api/v1/auth/reconnect - Reconnect MCP client
- GET /api/v1/auth/health - Auth service health check

Files created: 2
Files modified: 1"
```

---

## Step 4: Push to Branch

Push changes to your feature branch:

```bash
git push origin <branch-name>
```

**Note:** GitHub will provide a URL to create a pull request.

---

## Step 5: Create Pull Request

### Navigate to PR Creation

Use the URL provided by GitHub, or navigate manually:

```
https://github.com/<username>/<repo>/pull/new/<branch-name>
```

### PR Title Format

```
<type>: <Short descriptive title>
```

**Examples:**

- `feat: Add auth reconnect endpoint`
- `refactor: Remove transcription functionality, focus on notebook queries`
- `fix: Resolve MCP connection timeout issues`

---

### PR Description Template

```markdown
## 🔄 [Breaking Changes / New Feature / Bug Fix]

<Brief description of what this PR does and why>

## 📝 Changes Summary

### [Created/Deleted/Modified] Files (<number>)

- `path/to/file1.ts` - Description
- `path/to/file2.ts` - Description
- `path/to/file3.ts` - Description

### Dependencies [Added/Removed]

- `package-name` - Reason

## 🚫 Removed [Endpoints/Features]

- `ENDPOINT/FEATURE` - Description
- `ENDPOINT/FEATURE` - Description

## ✅ [New/Active] [Endpoints/Features]

- `ENDPOINT/FEATURE` - Description
- `ENDPOINT/FEATURE` - Description

## 🧪 Testing

- ✅ Test case 1
- ✅ Test case 2
- ✅ Test case 3

## 📊 Impact

- **Files changed**: <number>
- **Insertions**: +<number>
- **Deletions**: -<number>
- **Net change**: +/-<number> lines

## 📖 Documentation

- [ ] README updated
- [ ] API documentation updated
- [ ] Code comments added
- [ ] Walkthrough created
```

---

### Complete PR Description Example

```markdown
## 🔄 New Feature

Implemented authentication reconnect endpoint to allow users to reload MCP credentials without restarting the server.

## 📝 Changes Summary

### Created Files (2)

- `backend/src/api/services/auth.service.ts` - Auth service with reconnect method
- `backend/src/api/routes/auth.router.ts` - Auth router with reconnect and health endpoints

### Modified Files (1)

- `backend/src/api/routes/index.ts` - Added auth router to main routes

## ✅ New Endpoints

- `POST /api/v1/auth/reconnect` - Reconnect MCP client with existing credentials
- `GET /api/v1/auth/health` - Auth service health check

## 🧪 Testing

- ✅ Health endpoint returns 200 OK
- ✅ Reconnect endpoint successfully disconnects and reconnects MCP
- ✅ MCP connection verified working after reconnect
- ✅ Notebook endpoints still functional after reconnect

## 📊 Impact

- **Files changed**: 3
- **Insertions**: +85
- **Deletions**: -0
- **Net change**: +85 lines

## 📖 Usage

1. Run `notebooklm-mcp-auth` in terminal to refresh credentials
2. Call `POST /api/v1/auth/reconnect` to reload credentials
3. MCP client reconnects without server restart
```

---

## Step 6: Submit Pull Request

1. Fill in the PR title
2. Paste the PR description
3. Click "Create pull request"
4. Verify the PR was created successfully

---

## Step 7: Verify PR

**Checklist:**

- [ ] PR title is clear and descriptive
- [ ] PR description is comprehensive
- [ ] All sections are filled out
- [ ] Code changes are visible in "Files changed" tab
- [ ] No merge conflicts
- [ ] CI/CD checks pass (if configured)

---

## Quality Standards

### Commit Message

- ✅ Clear and concise subject line
- ✅ Detailed description of changes
- ✅ Lists all major changes
- ✅ Includes file counts and statistics

### PR Description

- ✅ Professional formatting with emojis
- ✅ Comprehensive change summary
- ✅ Testing verification
- ✅ Impact statistics
- ✅ Clear documentation of new/removed features

### Code Quality

- ✅ No lint errors
- ✅ All tests passing
- ✅ Code is well-documented
- ✅ Follows project conventions

---

## Tips

1. **Be Descriptive**: Explain WHY changes were made, not just WHAT changed
2. **Use Emojis**: Makes PR more readable (🔄 ✅ 🚫 📝 🧪 📊)
3. **Include Statistics**: Shows scope of changes
4. **Document Testing**: Proves changes work
5. **Link Issues**: Reference related issues if applicable
6. **Keep It Organized**: Use sections and bullet points

---

## Common Mistakes to Avoid

❌ Vague commit messages ("fix stuff", "update code")
❌ Missing PR description
❌ Not testing before committing
❌ Including unrelated changes
❌ Forgetting to update documentation
❌ Not reviewing your own PR first

---

## Example: Full Workflow Execution

```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Stage changes
git add -A

# 4. Create commit
git commit -m "feat: add auth reconnect endpoint

Implemented authentication reconnect endpoint to reload MCP credentials
without server restart.

Changes:
- Created auth.service.ts with reconnect method
- Created auth.router.ts with POST /reconnect endpoint
- Added auth routes to main router

New endpoints:
- POST /api/v1/auth/reconnect
- GET /api/v1/auth/health

Files created: 2
Files modified: 1"

# 5. Push to branch
git push origin feature/auth-reconnect

# 6. Use GitHub URL to create PR
# 7. Fill in PR description using template above
# 8. Submit PR
```

---

## Success Criteria

✅ Commit message follows conventional commits format
✅ PR description is comprehensive and well-formatted
✅ All changes are documented
✅ Testing is verified and documented
✅ Impact statistics are included
✅ PR is ready for review
