
# Fix Speech Synchronization + Enhance Interactivity

## Problem 1: Speech Sync (Chinese cuts off before English starts)

**Root Cause**: `WelcomePage.tsx` uses fixed `setTimeout` intervals (800ms, 3500ms, 6000ms, 9000ms, 11500ms) instead of waiting for each speech to actually finish. The `speak()` function already returns a Promise, but it's being ignored.

**The same pattern exists in**: `StoryPage.tsx` (line 144 - fires speech without waiting), and other pages where bilingual content plays.

### Fix Approach
- Rewrite the WelcomePage intro sequence to use **Promise chaining** instead of fixed timeouts: speak Chinese -> wait for it to end -> then speak English -> wait -> then next phase
- Apply the same pattern wherever bilingual speech is used across pages
- Add a small 300ms gap between languages for natural pacing

### Files to Change
- `src/lib/speech.ts` - Add a `delay()` helper and improve `speakBilingual` with a gap
- `src/pages/WelcomePage.tsx` - Replace setTimeout chain with async/await speech sequence
- `src/pages/StoryPage.tsx` - Ensure story narration waits for completion
- `src/pages/WorldTourPage.tsx` - CountryCard `handleListen` already chains correctly, but add gap

---

## Problem 2: Enhance Interactivity & Thinking

Current modules are somewhat passive (click to reveal, simple matching). Here are concrete enhancements per module:

### A. Language Magic House - Add "Spell It" drag-and-drop mode
- New mode: given a picture, drag pinyin/letters to spell the word in correct order
- Shuffled letter tiles that children must arrange, promoting active recall

### B. Traffic Hero City - Add "Why?" thinking prompts
- After each correct answer, ask a follow-up "why" question (e.g., "Why do we stop at red?") with 2 choices
- Rewards deeper thinking, not just pattern matching

### C. Science Lab - Add "Predict First" step
- Before each experiment result, ask kids to predict what will happen (2-3 choices)
- Show result after prediction, compare - teaches scientific method

### D. Treasure Hunt - Add assembly step after finding parts
- After finding all parts in a level, add a drag-to-correct-slot assembly mini-game
- Kids must figure out where each part goes on a barrier diagram

### E. Story Kingdom - Add "What happens next?" pause
- Before revealing the next scene, briefly show a thinking prompt
- Add a "draw/describe" free moment between story beats

### F. World Tour - Add quiz after each country
- After viewing a country card, ask one quick question about what they learned (e.g., "What powers Australia's barrier?")
- Must answer correctly to collect the stamp

### Files to Change
- `src/pages/LanguagePage.tsx` - Add SpellMode component
- `src/pages/TrafficPage.tsx` - Add "why" follow-up after correct answers
- `src/pages/LabPage.tsx` - Add prediction step before experiments
- `src/pages/TreasurePage.tsx` - Add assembly mini-game after finding parts
- `src/pages/WorldTourPage.tsx` - Add quiz question in CountryCard
- `src/pages/StoryPage.tsx` - Add thinking pause between story nodes

---

## Technical Details

### Speech sync fix (speech.ts)
```text
// Add gap helper
export function speakBilingual(zh, en, rate = 0.8): Promise<void> {
  return speak(zh, 'zh-CN', rate)
    .then(() => new Promise(r => setTimeout(r, 400)))  // natural pause
    .then(() => speak(en, 'en-US', rate));
}
```

### WelcomePage async sequence
```text
// Replace setTimeout chain with:
useEffect(() => {
  let cancelled = false;
  async function runIntro() {
    await delay(800);
    if (cancelled) return;
    setPhase('greeting'); ...
    await speak(greetingsZh[greetIdx], 'zh-CN', 0.85);
    if (cancelled) return;
    setShowSubtitle(greetingsEn[greetIdx]);
    await speak(greetingsEn[greetIdx], 'en-US', 0.8);
    if (cancelled) return;
    // ... continue chaining
  }
  runIntro();
  return () => { cancelled = true; stopSpeaking(); };
}, []);
```

### Interactivity enhancement pattern
Each enhancement follows: **Predict/Think -> Act -> Feedback -> Reflect**

For example, Lab prediction step:
```text
// Before experiment starts, show:
"What do you think will happen if we move the weight further?" 
  [A] Easier to lift  [B] Harder to lift
// Then run experiment, show if prediction was right
// Bonus star for correct prediction
```

## Implementation Order
1. Fix speech.ts and WelcomePage sync (highest priority - user-reported bug)
2. Apply sync fix to all other pages
3. Add interactivity enhancements to each module (can be done in parallel)
