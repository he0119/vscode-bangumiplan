# BangumiPlan 协作指南

BangumiPlan 是 VS Code 扩展，用 `.bp` 文件记录动画/媒体观看计划，提供语法高亮、悬浮提示、BGM 链接和条目时间操作。

## 核心文件

- `parser.js`：条目解析、片段定位、BGM 链接扫描、当前时间格式化。
- `extension.js`：注册 VS Code provider 和 code action，调用 `parser.js`。
- `syntaxes/bangumiplan.tmLanguage.json`：TextMate 语法高亮。
- `language-configuration.json`：语言括号和自动闭合配置。
- `test/entryRegex.test.js`：解析规则测试。

## BangumiPlan 格式

```text
正在看:
    动画:
        [512190]琉璃的宝石 √√√√√√√ (进度说明)
        [524707]作品名 <2024-12-15> (完成日期)
```

- 状态标题：0 个空格，例如 `正在看:`。
- 分类：4 个空格，例如 `    动画:`。
- 条目：8 个空格，例如 `        [123]作品名`。
- 条目格式：`[bgmId]标题 进度标记(说明) <日期>(说明)`。
- 进度标记支持：`√☑✅✓✔🗸`。
- 另一种进度格式：`[正在观看 详情]`。

## 必守规则

- 条目解析正则必须在 `parser.js` 的 `ENTRY_REGEX_SOURCE` 和 `syntaxes/bangumiplan.tmLanguage.json` 保持同步，捕获组 1-7 的语义不能漂移。
- 改动条目语法时，同步更新解析、TextMate 高亮、hover/code action 相关逻辑和 `test/entryRegex.test.js`。
- Hover 使用 `locateEntrySegments()` 按字符位置判断标题、进度、说明、日期等片段；新增 token 时要维护对应 range。
- BGM ID 使用 `[123456]`，链接目标是 `https://bgm.tv/subject/{id}`。
- `parser.js` 导出的解析工具供扩展和测试共用，不要把重复解析逻辑写回 `extension.js`。

## TextMate Scope

- `constant.numeric.bgm-id`：BGM ID。
- `entity.name.title`：作品标题。
- `string.progress`：进度标记。
- `string.date`：日期。
- `comment.note`：说明或备注。

## 开发命令

```bash
npm test
vsce package
```

- `npm test` 通过 `@vscode/test-cli` 运行 Mocha 测试。
- 手动调试扩展时，在 VS Code 中按 F5 启动 Extension Development Host。

## 发布规范

- 提交信息使用约定式提交格式，例如 `feat: 添加当前时间代码操作`。
- 新建分支使用约定式提交风格的类型前缀，例如 `feat/add-current-time-action` 或 `fix/entry-parser-date`。
- PR 标题使用约定式提交格式，例如 `feat: 添加当前时间代码操作`。
- 提交信息、PR 标题和 PR 描述使用中文。
