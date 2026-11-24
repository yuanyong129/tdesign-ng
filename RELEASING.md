# 发版流程

发的是三个包，顺序由依赖决定：

| 包 | 源目录 | 产物目录（publish 目标） |
| --- | --- | --- |
| `@tdesign-ng/styles` | `packages/styles` | 同源目录（less + 预编译 CSS） |
| `@tdesign-ng/icons` | `packages/icons` | `packages/dist/icons` |
| `@tdesign-ng/components` | `packages/ng-components` | `packages/dist/components` |

`@tdesign-ng/components` 的 `peerDependencies` 里有 `@tdesign-ng/styles`，所以必须先发 styles。

## 本地演练（推荐每次都跑）

```bash
pnpm run release:check   # = node scripts/publish-all.mjs --dry-run
```

它会：构建三个包 → 校验三包版本一致、components 的 styles peer 与待发版本匹配 → 校验产物清单（README/LICENSE、FESM、bridge.*、vendor）→ 对三个包各跑一次 `npm pack --dry-run`（演练模式不 publish）。

## 真发布

```bash
npm login                # 需要有 @tdesign-ng scope 的发布权限
pnpm run release         # = node scripts/publish-all.mjs
```

任一校验失败都会整体中止，不会出现「styles 发了、components 没发」的中间态。

> 注意：脚本把 `npm_config_cache` 指向仓库内 `.npm-cache/`。某些受限环境（沙箱）无法写用户目录缓存，这个重定向是必须的。

## 版本与 tag

三个包版本必须完全一致；`CHANGELOG.md` 里补一节，再改三个 `package.json` 的 `version`，然后：

```bash
git tag v0.1.0 && git push origin v0.1.0
```

**git tag 只用于发布**：tag 名必须是 `v<version>`，且该 version 必须等于 `packages/ng-components/package.json` 的 `version`。`release.yml` 会校验，不一致直接中止——避免出现「tag 说 0.4.0、npm 上却是 0.1.0」这种对不上的情况。

开发阶段的进度里程碑**不打 tag**，记在 [`docs/plans/milestones.md`](docs/plans/milestones.md)。历史上打过一个 `v0.4.0-alpha`（广度完成，2026-11-23），因为和 npm 版本号混用容易让人误以为 npm 上有 `0.4.0`，已在 0.1.0 首发准备时删除，内容保留在那里。

**版本只能往上走**：npm 会记住已发布的最高版本，发出去的版本不能撤回也不能被更低的版本覆盖。首发取低值安全，取高值是单向门。

推 tag 会触发 `.github/workflows/release.yml`：校验 tag 与 `packages/ng-components/package.json` 的版本一致，然后 `pnpm run release` 真发布，并带 npm provenance。也可以在 Actions 页面手动 `workflow_dispatch`（`dry_run` 默认 `true`）。

## CI 发布需要的东西

1. 仓库 Secrets 里加 `NPM_TOKEN`（npm 的 Automation token，有效期尽量短）。
2. `@tdesign-ng` scope 必须属于发布者（npm 组织 `tdesign-ng` 已创建且账号是成员）。
3. provenance 要求 `repository` 字段与 GitHub 仓库一致、仓库公开——已满足。
4. `pnpm-lock.yaml` 必须与三个 `package.json` 同步，否则 `pnpm install --frozen-lockfile` 会失败。

## 发完之后

```bash
npm view @tdesign-ng/components version
npm view @tdesign-ng/styles version
npm view @tdesign-ng/icons version
```

再在一个空 Angular 工程里验证安装（见根 `README.md` 的「安装」一节）：`@angular/cdk` 的 peer 范围是 `>=19.0.0 <24.0.0`，Angular 19/20/21 都不该报 ERESOLVE。
