# DeepSeek Harness Win32 Picker

为 DeepSeek Harness 的 Windows Web 界面提供原生文件夹选择器。用户从设置页或工作区流程选择目录时，插件打开 Windows `IFileOpenDialog`，并把当前前台浏览器窗口设为 owner，让选择器保持在发起操作的窗口上方。

## 安装到 DSH

需要 Windows、Node.js 22.19 或更高版本，以及已安装的 `dsh` CLI。把 npm 包安装到 `web` profile：

```sh
dsh plugin --profile web add deepseek-harness-win32-picker
dsh web
```

npm 包名是全局唯一名称，使用 npm 安装时不需要 GitHub 用户名。也可以直接从 GitHub 安装；GitHub 地址需要包含组织名：

```sh
dsh plugin --profile web add github:civilization-os/deepseek-harness-win32-picker
dsh web
```

安装或更新后需要重启正在运行的 `dsh web`，再刷新浏览器页面。插件会替换 web profile 的自适应目录选择器，并复用 DSH 自带的原生目录选择 UI。

更新或卸载：

```sh
dsh plugin --profile web update deepseek-harness-win32-picker
dsh plugin --profile web remove deepseek-harness-win32-picker
```

## 行为

- 只在 Windows 上启动；其他系统会在加载时给出明确错误。
- 使用现代 Windows 文件夹选择器，只允许选择文件系统目录。
- 在打开选择器前读取当前前台窗口，并把它传给 `IFileDialog::Show(owner)`。
- 取消选择返回空结果，不会当作执行错误。
- DSH 中止请求时，插件向选择器线程发送 `WM_CLOSE`；无响应时终止独立 worker 进程。
- COM 对话框在独立 Node.js 子进程中运行，不阻塞 DSH 主进程事件循环。

这个 owner 关系只让选择器位于发起操作的浏览器窗口上方，不会把它设为覆盖所有应用的系统级置顶窗口。

## 本地开发

```sh
pnpm install
pnpm test
pnpm build
```

把当前 checkout 安装到本机 web profile：

```sh
dsh plugin --profile web add .
dsh web
```

发布内容只有编译后的 host 插件、Win32 worker、DSH patch、README 和许可证。`koffi` 是运行时依赖；插件不下载浏览器或其他原生程序。

## 发布

GitHub Actions 在推送 `v*` tag 或手动运行工作流时执行测试、构建并发布 npm 包。仓库需要配置名为 `NPM_TOKEN` 的 Actions secret。tag 必须与 `package.json` 版本一致，例如 `0.1.0` 对应 `v0.1.0`。

## 许可证

[MIT](LICENSE)
