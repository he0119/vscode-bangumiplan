# BangumiPlan VS Code Extension - AI Coding Guide

## Project Overview

BangumiPlan is a VS Code extension for tracking anime/media watchlists with syntax highlighting, hover tooltips, and clickable BGM links. Files use `.bp` extension with structured indented format:

```
正在看:
    动画:
        [512190]琉璃的宝石 √√√√√√√ (进度说明)
        [524707]作品名 <2024-12-15> (完成日期)
```

## Core Architecture

### Key Components (3-layer structure)
1. **Language Definition** (`syntaxes/bangumiplan.tmLanguage.json`) - TextMate grammar for syntax highlighting
2. **Extension Logic** (`extension.js`) - VS Code providers for links, hover, parsing
3. **Language Config** (`language-configuration.json`) - Auto-closing pairs and brackets

### Critical Pattern: Regex Synchronization
The entry parsing regex MUST be identical between:
- `syntaxes/bangumiplan.tmLanguage.json` (capture groups 1-7)
- `extension.js` parseEntryLine function

Current pattern supports: `[bgmId]title progressMarks(note) <date>(note)`
- Progress marks: `√☑✅✓✔🗸`
- Alternative format: `[正在观看 details]`

## Development Workflows

### Testing
```bash
npm test  # Runs Mocha tests via @vscode/test-cli
```
Tests focus on `parseEntryLine()` function with comprehensive format coverage in `test/entryRegex.test.js`.

### Extension Development
```bash
# F5 in VS Code launches Extension Development Host
# Test with .bp files in new window
```

### Packaging
```bash
vsce package  # Creates .vsix file
```

## Project-Specific Conventions

### Indentation Rules (CRITICAL)
- Status headers: 0 spaces (`正在看:`)
- Categories: 4 spaces (`    动画:`)
- Entries: 8 spaces (`        [123]作品名`)

### Hover Provider Pattern
Uses character-position calculation to determine which part of entry line user is hovering over. The `locateSegment()` function sequentially matches tokens after title to find ranges.

### Extension Registration Pattern
Register providers in `activate()`:
```javascript
context.subscriptions.push(
  vscode.languages.registerDocumentLinkProvider({ language: "bangumiplan" }, new BgmLinkProvider()),
  vscode.languages.registerHoverProvider({ language: "bangumiplan" }, new hoverProvider())
);
```

## Critical Integration Points

### BGM.tv Links
BGM IDs in `[123456]` format auto-link to `https://bgm.tv/subject/{id}` via DocumentLinkProvider.

### TextMate Scopes
Syntax highlighting uses specific scopes:
- `constant.numeric.bgm-id` - BGM IDs (yellow underline)
- `entity.name.title` - Anime titles
- `constant.character.progress` - Progress marks (green bold)
- `constant.other.date` - Dates (orange italic)
- `comment.note` - Notes/descriptions (gray)

### Parser Export Pattern
`extension.js` exports `parseEntryLine` for testing via `module.exports = { activate, deactivate, parseEntryLine }`.

## When Adding New Syntax Features

1. Update regex in BOTH `tmLanguage.json` AND `extension.js`
2. Add corresponding capture group handling in hover provider
3. Update test cases in `entryRegex.test.js`
4. Consider if new TextMate scopes needed for highlighting
5. Test with various indentation levels and edge cases
