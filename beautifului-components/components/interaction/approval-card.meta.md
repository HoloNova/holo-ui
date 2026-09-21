# Approval Card

**Category**: Interaction  
**Source**: https://www.beautifului.dev/#approval-card  
**Tags**: approval, human-in-the-loop, card, form, question, hitl, radio, decision

## Description
The central HITL (Human-In-The-Loop) component. An agent card that:
- Presents a question with radio button options
- Allows custom text input as an alternative
- Supports multi-question flows with pagination (1 / 3)
- Has Skip and Continue actions
- Animates in with `fade-up`

## Dependencies
- `shared/base.css` — for `fade-up`, CSS variables, `.primitive-card-pad`, `.primitive-card-footer`
- Tailwind CSS v4

## Implementing Option Selection
```javascript
const options = document.querySelectorAll('[data-menu-row][aria-pressed]');
options.forEach(btn => {
  btn.addEventListener('click', () => {
    // Deselect all
    options.forEach(b => {
      b.setAttribute('aria-pressed', 'false');
      b.querySelector('.size-1\\.5').style.transform = 'scale(0)';
      b.querySelector('.size-4').style.background = '';
    });
    // Select clicked
    btn.setAttribute('aria-pressed', 'true');
    const dot = btn.querySelector('.size-1\\.5');
    const ring = btn.querySelector('.size-4');
    dot.style.transform = 'scale(1)';
    ring.style.background = 'var(--accent)';
    ring.style.boxShadow = 'none';
    // Enable Continue button
    document.querySelector('button[disabled]').disabled = false;
  });
});
```

## Multi-Question Flow
Change the slide content by translating the inner `div` (translate3d):
```javascript
let currentQ = 0;
const questions = [
  { title: 'Question 1?', options: ['A', 'B', 'C'] },
  { title: 'Question 2?', options: ['X', 'Y'] },
];
// Move to next: inner.style.transform = `translate3d(0, -${currentQ * 100}%, 0)`;
```

## Customization
- Change question text in `.pr-7.text-\[14px\]`
- Add/remove option buttons
- Update `1 / 3` pagination numbers dynamically
- Remove pagination for single-question flows
