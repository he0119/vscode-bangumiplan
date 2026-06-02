# Change Log

All notable changes to the "bangumiplan" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Changed

- 更新协作指南中的 TextMate scope 说明，使其与当前语法定义保持一致。
- 将条目解析与当前时间辅助逻辑拆分到独立 parser 模块，方便脱离 VS Code 宿主测试。

### Fixed

- 限制分类和条目缩进只接受空格，使解析和高亮行为符合 `.bp` 文件格式约定。
- 修复带进度说明的组合条目中日期和日期说明无法正确触发悬浮提示的问题。
- 限制 BGM 链接只匹配条目开头的 BGM ID，避免标题或备注中的方括号数字被误链接。

### Added

- 添加条目解析正则与 TextMate 语法正则的同步校验测试。
- 添加给条目追加或更新当前完成时间的代码操作。

## [0.2.1] - 2025-08-28

### Added

- 支持多种进度标记
- 支持进度详情格式 `[正在观看 进度详情]`

### Changed

- 不使用可变长度 lookbehind

## [0.2.0] - 2025-08-23

### Changed

- 统一使用一个正则表达式匹配条目

## [0.1.5] - 2025-08-23

### Fixed

- 修复带进度的条目格式高亮消失的问题

## [0.1.4] - 2025-08-23

### Fixed

- 修复无 ID 格式无法正常高亮的问题

## [0.1.3] - 2025-08-21

### Added

- 添加关键词

## [0.1.2] - 2025-08-21

### Removed

- 移除 galleryBanner 配置

## [0.1.1] - 2025-08-21

### Changed

- 更新仓库 URL 为 GitHub 地址

## [0.1.0] - 2025-08-21

### Added

- 添加扩展图标

## [0.0.2] - 2025-08-21

### Added

- 高亮使用标准的名称

### Removed

- 删除自带主题

## [0.0.1] - 2025-08-21

- Initial release

[Unreleased]: https://github.com/he0119/vscode-bangumiplan/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/he0119/vscode-bangumiplan/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.1...v0.1.0
[0.1.0]: https://github.com/he0119/vscode-bangumiplan/compare/v0.1.0...v0.0.2
[0.0.2]: https://github.com/he0119/vscode-bangumiplan/compare/v0.0.2...v0.0.1
[0.0.1]: https://github.com/he0119/vscode-bangumiplan/releases/tag/v0.0.1
