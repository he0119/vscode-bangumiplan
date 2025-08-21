# BangumiPlan 扩展

这是一个专为番剧追踪计划文件设计的 VS Code 扩展。

## 功能特性

### 🎨 语法高亮

- **状态标题**：`正在看`、`搁置` 等状态用蓝色高亮显示
- **分类标题**：`动画`、`电视剧`、`云游戏` 等分类用青色高亮显示
- **BGM ID**：`[数字]` 格式的 BGM ID 用黄色下划线显示，点击可跳转到对应的 BGM 页面
- **观看标记**：`√` 符号用绿色粗体显示，表示观看进度
- **条目标题**：作品名称用默认颜色显示

### 🖱️ 智能悬浮提示

- **观看计数**：鼠标悬浮在 `√` 符号上时，自动显示观看的集数
- **条目信息**：鼠标悬浮在条目标题上时，显示作品信息和观看进度
- **BGM 链接**：鼠标悬浮在 BGM ID 上时，显示跳转提示

### 🔗 点击跳转

- 点击 BGM ID（如 `[512190]`）可直接跳转到对应的 BGM 网站页面

## 文件格式示例

```text
正在看:
    2025年七月新番:
        [512190]琉璃的宝石 √√√√√√√
        [524707]我怎么可能成为你的恋人，不行不行！(※不是不可能！？) √√√√√√√
        [506677]Silent Witch 沉默魔女的秘密 √√√√√√√
    动画:
        [95225]Fate/stay night [Unlimited Blade Works]
    电视剧:
        异形：地球 √√
        基地 第三季 √
    云游戏:
        明日方舟:孤星 [正在观看 CW-2]

搁置:
    动画:
        [448677]非人哉 第三季 √
        [492199]明日方舟：焰烬曙明 √
        [485936]mono女孩 √√
```

## 使用说明

1. 创建一个 `.bp` 扩展名的文件
2. 按照上述格式编写你的追番计划
3. 享受语法高亮和智能提示功能！

### 格式规则

- 使用4个空格缩进表示分类
- 使用8个空格缩进表示具体条目
- `[数字]` 格式表示 BGM ID
- `√` 符号表示观看进度，每个 `√` 代表一集

## 安装使用

1. 在 VS Code 中打开扩展文件夹
2. 按 `F5` 启动扩展开发主机
3. 在新窗口中打开 `.bp` 文件
4. 享受语法高亮和智能提示功能

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个扩展！

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
