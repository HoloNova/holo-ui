## Description

<!-- Provide a concise summary of the changes introduced by this pull request. -->

---

## Type of Change

- [ ] New component primitive (`.snippet.html` + `.meta.md`)
- [ ] New design system or guidelines (`tokens.css` + foundations)
- [ ] Index or router update (`INDEX.json` / `ROUTER.json`)
- [ ] Bug fix or snippet correction
- [ ] Documentation improvement (`README`, guides, contributor SOP)

---

## Pre-Merge Quality Checklist

Please verify all items before requesting review:

### Code & Standalone Verification
- [ ] Snippets are self-contained or depend strictly on the library's `shared/base.css` or `tokens.css`.
- [ ] No hard framework runtime lock-in (pure semantic HTML + CSS custom properties).
- [ ] Touch targets adhere to minimum accessibility standards (minimum 44x44px for touch elements).

### Index & Context Guard Compliance
- [ ] Registered in `INDEX.json` under `by_style` (with `name`, `aesthetic`, `when_to_use`, `when_not_to_use`).
- [ ] Registered in `INDEX.json` under `by_function` (with `recommended_when` condition).
- [ ] No preview gallery files (like `index.html`) are placed in the agent retrieval path.
- [ ] All referenced relative file paths physically exist on disk.

### Style & Typography Standards
- [ ] **Strict Emoji Ban**: Zero emojis in file names, code comments, documentation, commit messages, or PR description.
- [ ] Clean markdown typography adhered to (tables, ASCII diagrams, GitHub alerts).
- [ ] No author biographies or third-party CLI installation clutter.

---

## Related Issue

<!-- Closes #123 -->
Closes #
