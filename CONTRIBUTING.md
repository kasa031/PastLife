# Contributing to PastLife

Thank you for your interest in contributing to PastLife! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Browser/Device**: Browser and device information
- **Screenshots**: If applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- **Feature Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the code style guidelines
   - Add comments for complex logic
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add: Description of your feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots if UI changes

## 📋 Code Style Guidelines

### JavaScript

- Use **ES6+ features** (arrow functions, const/let, template literals)
- Use **meaningful variable names**
- Add **comments** for complex logic
- **Export** functions that need to be used elsewhere
- Keep functions **focused and small**

**Example:**
```javascript
// Good ✅
export function getUserById(id) {
    const users = getAllUsers();
    return users.find(user => user.id === id);
}

// Bad ❌
function get(id) {
    return users.find(u => u.id === id);
}
```

### HTML

- Use **semantic HTML5** elements
- Include **ARIA labels** for accessibility
- Keep structure **clean and organized**

### CSS

- Use **CSS custom properties** (variables) for colors
- Follow **BEM naming** convention where appropriate
- Keep styles **organized by component**

## 🧪 Testing

Before submitting a pull request, please:

1. **Test in multiple browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

2. **Test on different devices**
   - Desktop
   - Tablet
   - Mobile

3. **Test offline functionality** (if applicable)
   - Disable network
   - Verify app works offline

4. **Check browser console**
   - No errors
   - No warnings

## 🔒 Security

- **Never commit API keys** or sensitive information
- **Sanitize all user input** before displaying
- **Validate all user input** before processing
- **Use secure practices** for data handling

## 📝 Commit Messages

Use clear, descriptive commit messages:

**Format:**
```
Type: Brief description

Longer description if needed
```

**Types:**
- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Update existing feature
- `Remove:` - Remove feature
- `Refactor:` - Code refactoring
- `Docs:` - Documentation changes
- `Style:` - Code style changes
- `Test:` - Test additions/changes

**Examples:**
```
Add: Favorite functionality for persons
Fix: Image upload error on mobile devices
Update: Improve search performance
Refactor: Simplify data storage logic
```

## 🚫 What Not to Do

- Don't commit **API keys** or sensitive data
- Don't break **existing functionality**
- Don't add **unnecessary dependencies**
- Don't ignore **accessibility** requirements
- Don't skip **testing**

## ✅ Pull Request Checklist

Before submitting a pull request, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass (if applicable)
- [ ] Tested in multiple browsers
- [ ] Tested on different devices
- [ ] No console errors or warnings
- [ ] Code is commented where needed
- [ ] Documentation is updated (if needed)
- [ ] Commit messages are clear
- [ ] No sensitive data is committed

## 🎯 Priority Areas

We especially welcome contributions in:

- **Accessibility improvements**
- **Performance optimizations**
- **Bug fixes**
- **Documentation improvements**
- **Internationalization** (i18n)
- **Testing**
- **Security enhancements**

## 📚 Resources

- [Developer Guide](docs/guides/DEVELOPER_GUIDE.md)
- [README.md](README.md)
- [TODO List](TODO_KONSOLIDERT.md)

## ❓ Questions?

If you have questions, please:
- Check the [Developer Guide](docs/guides/DEVELOPER_GUIDE.md)
- Check existing issues
- Create a new issue with your question

## 🙏 Thank You!

Thank you for contributing to PastLife! Your contributions help make this project better for everyone.

---

**Happy Contributing! 🚀**

