# 手机访问发布方案

这个网页是纯静态页面，发布时只需要上传本文件夹。

## 中国大陆访问建议

海外免费静态托管在中国大陆都可能受网络波动影响。建议三个都试一下，然后用手机流量和家里 Wi-Fi 各测一次：

1. Cloudflare Pages
2. Netlify
3. GitHub Pages

测完选打开最快、图片加载最完整的链接发给朋友。

## Cloudflare Pages

适合优先尝试。

1. 登录 Cloudflare。
2. 进入 Workers & Pages。
3. 创建 Pages 项目。
4. 选择 Direct Upload。
5. 上传 `friendship-site-deploy.zip`，或上传本文件夹里的所有文件。

如果之后用命令行发布，目录就是这个文件夹，配置文件是 `wrangler.toml`。

## Netlify

最适合不会折腾命令行的方式。

1. 登录 Netlify。
2. 进入 Add new site。
3. 选择 Deploy manually。
4. 拖入 `friendship-site-deploy.zip`，或拖入整个 `friendship-site` 文件夹。

配置文件是 `netlify.toml`。

## GitHub Pages

我已经准备好 `.nojekyll`，适合发布静态文件。

这台机器已经通过 GitHub CLI 登录过，可以自动推送 `gh-pages` 分支。也可以手动用两种方式：

1. 在仓库中新建 `gh-pages` 分支，把本文件夹内容上传到分支根目录。
2. 到仓库 Settings → Pages，把 Source 设为 `gh-pages` / root。

最终链接一般是：

`https://zhaiguowen123-cpu.github.io/thai-social-server/`
