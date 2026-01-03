# Contributing to Preṣaka

Thank you for your interest in contributing to Preṣaka! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and professional in all interactions.

---

## How to Contribute

### 1. Reporting Bugs

**Before submitting a bug report:**
- Check if the bug has already been reported in [Issues](https://github.com/your-org/presaka/issues)
- Ensure you're using the latest version

**When submitting a bug report, include:**
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

**Example:**
```markdown
**Bug:** Messages not delivered in private chat

**Steps to reproduce:**
1. Login as User A
2. Send message to User B
3. User B doesn't receive message

**Expected:** Message should be delivered
**Actual:** Message stuck in "sending" state

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Node: 18.17.0
```

---

### 2. Suggesting Features

**Before suggesting a feature:**
- Check if it's already been suggested
- Ensure it aligns with project goals

**When suggesting a feature, include:**
- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (optional)
- Mockups / wireframes (if applicable)

---

### 3. Pull Requests

#### Setup Development Environment

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/your-username/presaka.git
cd presaka

# Add upstream remote
git remote add upstream https://github.com/your-org/presaka.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

---

#### Create a Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

---

#### Make Changes

**Code Style:**
- Follow existing code style
- Use ESLint and Prettier
- Write meaningful commit messages

**Commit Message Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```bash
git commit -m "feat(auth): add phone number validation"
git commit -m "fix(chat): resolve message delivery issue"
git commit -m "docs(api): update authentication endpoints"
```

---

#### Testing

**Before submitting PR:**
```bash
# Run linter
npm run lint

# Run tests
npm test

# Run type checking (if TypeScript)
npm run type-check

# Build project
npm run build
```

**Write tests for:**
- New features
- Bug fixes
- Edge cases

---

#### Submit Pull Request

1. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

2. **Create PR on GitHub:**
- Clear, descriptive title
- Reference related issues
- Describe changes made
- Include screenshots (if UI changes)
- List breaking changes (if any)

**PR Template:**
```markdown
## Description
Brief description of changes

## Related Issues
Fixes #123

## Changes Made
- Added phone validation
- Updated error messages
- Added unit tests

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

---

## Development Guidelines

### Code Style

**JavaScript/TypeScript:**
```javascript
// Use const/let, not var
const userName = 'John';
let counter = 0;

// Use arrow functions
const greet = (name) => `Hello, ${name}`;

// Use async/await
const fetchUser = async (id) => {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return user;
};

// Destructuring
const { name, email } = user;

// Template literals
const message = `Welcome, ${name}!`;
```

---

### File Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   ├── utils/          # Helper functions
│   └── config/         # Configuration
├── tests/              # Test files
└── package.json

frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   ├── utils/          # Helper functions
│   └── styles/         # CSS/Tailwind
├── public/             # Static assets
└── package.json
```

---

### Naming Conventions

**Files:**
- Components: `PascalCase.jsx` (e.g., `ChatMessage.jsx`)
- Utilities: `camelCase.js` (e.g., `formatDate.js`)
- Constants: `UPPER_SNAKE_CASE.js` (e.g., `API_ENDPOINTS.js`)

**Variables:**
- camelCase for variables and functions
- PascalCase for classes and components
- UPPER_SNAKE_CASE for constants

---

### Documentation

**Add JSDoc comments:**
```javascript
/**
 * Send OTP to user's phone number
 * @param {string} phone - Phone number in E.164 format
 * @returns {Promise<Object>} OTP request details
 * @throws {Error} If phone number is invalid
 */
async function sendOTP(phone) {
  // Implementation
}
```

---

## Testing Guidelines

### Unit Tests

```javascript
// Example test
describe('Phone Validation', () => {
  it('should accept valid phone number', () => {
    const phone = '+919876543210';
    expect(validatePhone(phone)).toBe(true);
  });

  it('should reject invalid phone number', () => {
    const phone = '1234567890';
    expect(() => validatePhone(phone)).toThrow();
  });
});
```

---

### Integration Tests

```javascript
// Example API test
describe('POST /api/auth/request-otp', () => {
  it('should send OTP successfully', async () => {
    const response = await request(app)
      .post('/api/auth/request-otp')
      .send({ phone: '+919876543210' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

---

## Review Process

1. **Automated checks** - CI/CD runs tests and linting
2. **Code review** - Maintainers review code
3. **Feedback** - Address review comments
4. **Approval** - PR approved by maintainer
5. **Merge** - PR merged to main branch

---

## Getting Help

- **Documentation:** Check [docs/](docs/) folder
- **Issues:** Search existing issues
- **Discussions:** GitHub Discussions
- **Email:** dev@presaka.app

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Preṣaka! 🚀

