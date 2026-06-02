# BangumiPlan VS Code 扩展协作指南

## 项目概览

BangumiPlan 是一个用于记录动画/媒体观看计划的 VS Code 扩展，提供语法高亮、悬浮提示和可点击的 BGM 链接。文件使用 `.bp` 扩展名，并采用固定缩进结构：

```text
正在看:
    动画:
        [512190]琉璃的宝石 √√√√√√√ (进度说明)
        [524707]作品名 <2024-12-15> (完成日期)
```

## 核心架构

### 关键组件（三层结构）

1. **语言定义**：`syntaxes/bangumiplan.tmLanguage.json`，用于 TextMate 语法高亮。
2. **扩展逻辑**：`extension.js`，包含 VS Code provider、链接、悬浮提示和解析逻辑。
3. **语言配置**：`language-configuration.json`，包含自动闭合符号和括号配置。

### 关键规则：正则同步

条目解析正则必须在以下两个位置保持一致：

- `syntaxes/bangumiplan.tmLanguage.json`，捕获组 1-7。
- `extension.js` 中的 `parseEntryLine` 函数。

当前格式支持：`[bgmId]标题 进度标记(说明) <日期>(说明)`。

- 进度标记：`√☑✅✓✔🗸`
- 另一种进度格式：`[正在观看 详情]`

## 开发流程

### 测试

```bash
npm test
```

该命令通过 `@vscode/test-cli` 运行 Mocha 测试。测试主要覆盖 `parseEntryLine()`，测试文件位于 `test/entryRegex.test.js`。

### 扩展开发

```bash
# 在 VS Code 中按 F5 启动 Extension Development Host
# 在新窗口中使用 .bp 文件测试扩展行为
```

### 打包

```bash
vsce package
```

该命令会生成 `.vsix` 文件。

## 项目约定

### 缩进规则（重要）

- 状态标题：0 个空格，例如 `正在看:`。
- 分类：4 个空格，例如 `    动画:`。
- 条目：8 个空格，例如 `        [123]作品名`。

### Hover Provider 模式

Hover provider 通过字符位置计算判断用户悬停在条目行的哪个部分。`locateSegment()` 会在标题之后按顺序匹配 token，并计算每个片段的 range。

### 扩展注册模式

在 `activate()` 中注册 provider：

```javascript
context.subscriptions.push(
  vscode.languages.registerDocumentLinkProvider({ language: "bangumiplan" }, new BgmLinkProvider()),
  vscode.languages.registerHoverProvider({ language: "bangumiplan" }, new hoverProvider())
);
```

### 发布规范

- 提交信息使用约定式提交格式，例如 `feat: 添加当前时间代码操作`。
- 提交信息、PR 标题和 PR 描述使用中文。

## 关键集成点

### BGM.tv 链接

`[123456]` 格式的 BGM ID 会通过 `DocumentLinkProvider` 自动链接到 `https://bgm.tv/subject/{id}`。

### TextMate Scope

语法高亮使用以下 scope：

- `constant.numeric.bgm-id`：BGM ID，黄色下划线。
- `entity.name.title`：作品标题。
- `constant.character.progress`：进度标记，绿色加粗。
- `constant.other.date`：日期，橙色斜体。
- `comment.note`：说明或备注，灰色。

### Parser 导出模式

`extension.js` 导出 `parseEntryLine` 以供测试使用：

```javascript
module.exports = { activate, deactivate, parseEntryLine };
```

## 添加新语法功能时

1. 同时更新 `tmLanguage.json` 和 `extension.js` 中的正则。
2. 在 hover provider 中添加对应的捕获组处理。
3. 在 `entryRegex.test.js` 中增加测试用例。
4. 判断是否需要新的 TextMate scope 以支持语法高亮。
5. 用不同缩进层级和边界情况测试新功能。
