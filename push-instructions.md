# 推送项目到GitHub的说明

由于缺少GitHub Personal Access Token，无法直接通过HTTPS推送。请按照以下步骤手动推送项目：

## 方法1：使用Personal Access Token

1. 在GitHub上创建Personal Access Token：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token"
   - 选择适当的权限（至少需要repo权限）
   - 复制生成的token

2. 设置git凭据：
   ```bash
   cd /home/ubuntu/.openclaw/workspace/pacman-game
   git remote set-url origin https://<your_token>@github.com/netfoxor/pacman-h5-game.git
   git push -u origin main
   ```

## 方法2：使用SSH密钥

如果您想使用我们之前生成的SSH密钥：

1. 将SSH公钥添加到您的GitHub账户：
   - 公钥位置：`~/.ssh/github_key.pub`
   - 复制公钥内容并添加到GitHub账户的SSH keys中
   
2. 使用SSH URL：
   ```bash
   cd /home/ubuntu/.openclaw/workspace/pacman-game
   git remote set-url origin git@github.com:netfoxor/pacman-h5-game.git
   git push -u origin main
   ```

## 验证推送结果

推送成功后，您可以在 https://github.com/netfoxor/pacman-h5-game 查看项目。

## 项目信息

- **项目名称**: Pacman H5 Game
- **描述**: A classic Pacman game implemented using HTML5 Canvas, CSS3, and JavaScript
- **技术栈**: HTML5, CSS3, JavaScript, Canvas
- **测试**: 包含Jest单元测试
- **功能**: 
  - 经典吃豆人玩法
  - 迷宫导航
  - 多个幽灵AI
  - 得分系统
  - 生命值系统
  - 胜负条件