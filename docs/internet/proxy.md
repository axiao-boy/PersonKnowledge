# 自建代理服务器实操指南（VPS + V2Ray）

本指南介绍如何在一台 VPS 上搭建 V2Ray 代理服务，并配置各平台客户端。适用于个人隐私保护、远程办公访问内网资源等合法用途。

> ⚠️ **合规提醒**：请遵守当地法律法规，仅用于合法用途。不得用于从事违法活动或传播违法信息。

---

## 代理原理速览

```
你的设备 → [加密] → 代理服务器(VPS) → [明文] → 目标网站
                     (目标看到的IP是VPS的IP)
```

- 你的真实 IP 对目标网站隐藏
- 本地网络运营商只能看到你连接了 VPS（加密流量），看不到具体内容
- V2Ray 相比传统代理：协议更现代、支持多种传输方式、抗干扰更强

---

## 准备工作

### 1. 购买 VPS

| 服务商 | 价格参考 | 特点 | 适合人群 |
|--------|----------|------|----------|
| **Vultr** | $2.5-6/月 | 按小时计费，机房多，随开随关 | 新手推荐 |
| **BandwagonHost（搬瓦工）** | $49.99/年起 | 国内优化线路，稳定 | 追求稳定 |
| **DigitalOcean** | $4/月起 | 老牌稳定，文档全 | 技术用户 |
| **Linode** | $5/月起 | 性能稳定 | 技术用户 |
| **腾讯云/阿里云轻量** | ¥24/月起 | 国内厂商，备案方便 | 国内访问 |

**选购要点**：

| 要点 | 说明 |
|------|------|
| **机房位置** | 日本、新加坡、香港对中国大陆延迟较低（100-150ms）；美国西海岸次之（150-200ms） |
| **系统** | 推荐 Ubuntu 22.04 LTS 或 Debian 12 |
| **配置** | 1核 512MB 内存足够个人使用 |
| **流量** | 注意月流量限制，500GB/月足够日常使用 |
| **支付** | 支持支付宝/微信的优先（搬瓦工、腾讯云等） |

### 2. 连接 VPS

购买后会获得：`IP地址`、`用户名（root）`、`密码`或`SSH密钥`

```bash
# Linux/Mac/Windows10+ 终端连接
ssh root@你的VPS_IP

# 首次连接输入 yes 确认指纹，然后输入密码
```

### 3. 初始化系统（推荐）

```bash
# 更新系统
apt update && apt upgrade -y

# 安装常用工具
apt install -y curl wget vim ufw

# 设置时区
timedatectl set-timezone Asia/Shanghai

# （可选）修改 SSH 端口提升安全
vim /etc/ssh/sshd_config
# 找到 #Port 22，改为 Port 22222（自定义），保存退出
systemctl restart sshd
```

---

## 服务端安装 V2Ray

### 方式一：官方一键脚本（推荐新手）

使用 v2fly 官方维护的安装脚本：

```bash
bash <(curl -L https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)
```

安装完成后：
- 程序：`/usr/local/bin/v2ray`
- 配置：`/usr/local/etc/v2ray/config.json`
- 日志：`/var/log/v2ray/`
- 服务管理：`systemctl`

### 方式二：手动安装

```bash
# 下载最新版（以 v5.x 为例）
wget https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-linux-64.zip

# 解压
mkdir -p /usr/local/etc/v2ray /usr/local/share/v2ray
unzip v2ray-linux-64.zip -d /usr/local/share/v2ray
cp /usr/local/share/v2ray/config/*.json /usr/local/etc/v2ray/ 2>/dev/null

# 下载 geoip/geosite 数据
wget -P /usr/local/share/v2ray https://github.com/v2fly/geoip/releases/latest/download/geoip.dat
wget -P /usr/local/share/v2ray https://github.com/v2fly/domain-list-community/releases/latest/download/dlc.dat
```

---

## 服务端配置

### 配置一：VMess + WebSocket（推荐，配合 CDN）

编辑配置文件：

```bash
vim /usr/local/etc/v2ray/config.json
```

写入以下内容（替换 `你的UUID`）：

```json
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [
    {
      "tag": "vmess-in",
      "port": 10086,
      "listen": "0.0.0.0",
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "在这里填入你的UUID",
            "level": 1,
            "alterId": 0
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
          "path": "/你的路径"
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      "protocol": "blackhole",
      "tag": "blocked",
      "settings": {}
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "ip": [
          "geoip:private"
        ],
        "outboundTag": "blocked"
      }
    ]
  }
}
```

### 生成 UUID

```bash
v2ray uuid
# 输出类似：b831381d-6324-4d53-ad4f-8cda48b30811
```

将生成的 UUID 填入配置文件的 `id` 字段。

### 配置字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `port` | 服务端监听端口 | 10086 |
| `id` | UUID，客户端需一致 | `b831...30811` |
| `alterId` | AEAD 加密建议设为 0 | 0 |
| `network` | 传输协议，`ws` 为 WebSocket | ws |
| `path` | WS 路径，客户端需一致 | `/mypath` |
| `routing` | 路由规则，屏蔽私有 IP 访问 | - |

### 启动服务

```bash
# 启动
systemctl start v2ray

# 设置开机自启
systemctl enable v2ray

# 查看状态
systemctl status v2ray

# 查看日志
journalctl -u v2ray -f
```

### 开放防火墙端口

```bash
# UFW 防火墙
ufw allow 10086/tcp
ufw allow 22/tcp       # SSH
ufw enable
ufw status
```

---

## 客户端配置

### 通用参数（所有客户端通用）

| 参数 | 值 |
|------|-----|
| 地址 | VPS 的 IP |
| 端口 | 10086 |
| 用户 ID | 你的 UUID |
| 额外 ID（alterId） | 0 |
| 加密方式 | auto |
| 传输协议 | WebSocket（ws） |
| 路径 | /你的路径 |
| 底层传输 | tcp |

### Windows 客户端：v2rayN

| 步骤 | 操作 |
|------|------|
| 1. 下载 | GitHub 搜索 `v2rayN`，下载最新 `v2rayN.zip` |
| 2. 解压 | 解压到任意目录，运行 `v2rayN.exe` |
| 3. 添加 | 服务器 → 添加 VMess 服务器 |
| 4. 填写 | 按上表通用参数填写 |
| 5. 启用 | 右键托盘图标 → 系统代理 → 自动配置系统代理 |
| 6. 测试 | 浏览器访问 google.com 验证 |

### Mac 客户端：V2RayU / ClashX

| 步骤 | 操作 |
|------|------|
| 1. 下载 | GitHub 搜索 `V2RayU`，下载 `.dmg` |
| 2. 安装 | 拖入应用程序文件夹，打开 |
| 3. 添加 | Servers → 添加，按通用参数填写 |
| 4. 启用 | 菜单栏图标 → Pac 模式或全局模式 |

### Android 客户端：v2rayNG

| 步骤 | 操作 |
|------|------|
| 1. 下载 | Google Play 或 GitHub 搜索 `v2rayNG` |
| 2. 添加 | 右上角 + → 手动输入 VMess |
| 3. 填写 | 按通用参数填写 |
| 4. 启用 | 选中节点 → 右下角 V 图标启动 |

### iOS 客户端：Shadowrocket（需美区账号）

| 步骤 | 操作 |
|------|------|
| 1. 下载 | App Store 搜索 Shadowrocket（$2.99） |
| 2. 添加 | 右上角 + → 类型选 VMess |
| 3. 填写 | 按通用参数填写 |
| 4. 启用 | 开启开关 → 选择全局/规则模式 |

---

## 分享链接格式（便捷导入）

VMess 链接格式（Base64 编码的 JSON）：

```
vmess://eyJ2IjoiMiIsInBzIjoi5L2g5aW9IiwiYWRkIjoi5L2c55qEVlBTX0lQIiwi...（Base64编码内容）
```

对应的 JSON 明文结构：

```json
{
  "v": "2",
  "ps": "节点名称",
  "add": "VPS_IP地址",
  "port": "10086",
  "id": "你的UUID",
  "aid": "0",
  "net": "ws",
  "path": "/你的路径",
  "type": "none",
  "host": "",
  "tls": ""
}
```

> 💡 客户端大多支持粘贴 `vmess://` 链接自动导入，无需手动填写每个字段。

---

## 进阶优化：TLS + WebSocket + CDN

裸跑 VMess 易被识别。套用 TLS + CDN 可大幅提升隐蔽性和稳定性。

### 架构

```
客户端 → [TLS加密] → CDN(域名) → VPS:443 → Nginx → V2Ray(本地10086)
```

### 1. 准备域名并解析

| 步骤 | 操作 |
|------|------|
| 1. 购买域名 | 阿里云/腾讯云/Namesilo 购买 |
| 2. 解析到 VPS | 添加 A 记录，指向 VPS IP |
| 3. 接入 CDN | Cloudflare 注册，将 NS 改为 CF，开启代理（橙云） |

### 2. 申请 SSL 证书

```bash
# 安装 acme.sh
curl https://get.acme.sh | sh

# 申请证书（DNS 验证，需配置 CF API Token）
acme.sh --issue --dns dns_cf -d 你的域名.com

# 安装证书
mkdir -p /etc/nginx/ssl
acme.sh --install-cert -d 你的域名.com \
  --key-file /etc/nginx/ssl/key.pem \
  --fullchain-file /etc/nginx/ssl/cert.pem \
  --reloadcmd "systemctl reload nginx"
```

### 3. 配置 Nginx 反向代理

```bash
apt install -y nginx
vim /etc/nginx/conf.d/v2ray.conf
```

写入：

```nginx
server {
    listen 443 ssl http2;
    server_name 你的域名.com;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location /你的路径 {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:10086;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
nginx -t          # 测试配置
systemctl restart nginx
systemctl enable nginx
```

### 4. 更新 V2Ray 配置

V2Ray 只监听本地，由 Nginx 转发：

```json
{
  "inbounds": [{
    "port": 10086,
    "listen": "127.0.0.1",
    "protocol": "vmess",
    "settings": { "clients": [{ "id": "你的UUID", "alterId": 0 }] },
    "streamSettings": { "network": "ws", "wsSettings": { "path": "/你的路径" } }
  }]
}
```

### 5. 客户端参数更新

| 参数 | 裸跑 | TLS+CDN |
|------|------|---------|
| 地址 | VPS IP | 你的域名.com |
| 端口 | 10086 | 443 |
| 传输协议 | ws | ws |
| 传输层安全 | 无 | tls |
| 伪装域名 | - | 你的域名.com |

---

## 安全与维护

### 安全清单

| 项目 | 操作 | 重要性 |
|------|------|--------|
| **改 SSH 端口** | 修改 `/etc/ssh/sshd_config` 的 Port | ⭐⭐⭐ |
| **禁用密码登录** | 改用密钥登录，`PasswordAuthentication no` | ⭐⭐⭐ |
| **启用防火墙** | UFW 只放行 SSH + 443 | ⭐⭐⭐ |
| **Fail2ban** | 防止 SSH 暴力破解 | ⭐⭐ |
| **定期更新** | `apt update && apt upgrade` | ⭐⭐⭐ |
| **不泄露 UUID** | UUID 等同密码，不要公开 | ⭐⭐⭐ |
| **关闭多余端口** | V2Ray 只监听 127.0.0.1（套 CDN 时） | ⭐⭐ |

### 安装 Fail2ban

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 维护命令速查

| 操作 | 命令 |
|------|------|
| 启动 | `systemctl start v2ray` |
| 停止 | `systemctl stop v2ray` |
| 重启 | `systemctl restart v2ray` |
| 状态 | `systemctl status v2ray` |
| 查看日志 | `journalctl -u v2ray -f` |
| 查看错误日志 | `tail -f /var/log/v2ray/error.log` |
| 更新 V2Ray | 重跑官方安装脚本 |
| 查看流量 | `vnstat` 或 V2Ray API |

---

## 故障排查

| 现象 | 可能原因 | 解决方法 |
|------|----------|----------|
| 连不上 | 端口未开放 | `ufw allow 端口` |
| 连不上 | V2Ray 未运行 | `systemctl status v2ray` |
| 连得上但打不开网页 | DNS 问题 | 客户端开启"远程DNS" |
| 套 CDN 后连不上 | Nginx 配置错误 | `nginx -t` 检查 |
| 套 CDN 后连不上 | WS 路径不匹配 | 检查 Nginx 和 V2Ray 的 path 一致 |
| 速度慢 | CDN 节点远 | CF 切换 Argo 或换机房 |
| 速度慢 | VPS 带宽小 | 升级 VPS 套餐 |
| 间歇断连 | IP 被限制 | 换 IP 或套 CDN |

### 日志检查命令

```bash
# V2Ray 服务日志
journalctl -u v2ray -f

# Nginx 访问日志
tail -f /var/log/nginx/access.log

# 系统资源
top
df -h
free -m
```

---

## 费用估算

| 项目 | 费用 | 说明 |
|------|------|------|
| VPS | $2.5-6/月 | 主成本 |
| 域名 | ¥50-100/年 | 可选（套 CDN 需要） |
| CDN | 免费 | Cloudflare 免费版够用 |
| SSL 证书 | 免费 | acme.sh 自动申请 |
| 客户端 | 免费/一次性 | v2rayN/v2rayNG 免费，Shadowrocket $2.99 |
| **合计** | **约 ¥20-50/月** | 个人使用足够 |

---

## 方案对比

| 方案 | 速度 | 稳定性 | 隐蔽性 | 配置难度 |
|------|------|--------|--------|----------|
| **裸跑 VMess** | 快 | 一般 | 低 | ⭐ 简单 |
| **VMess + WS** | 快 | 较好 | 中 | ⭐⭐ |
| **VMess + WS + TLS** | 快 | 好 | 高 | ⭐⭐⭐ |
| **VMess + WS + TLS + CDN** | 中 | 很好 | 很高 | ⭐⭐⭐⭐ |
| **VLESS + Reality** | 快 | 好 | 极高 | ⭐⭐⭐⭐ |

> 💡 **新手建议**：先用「VMess + WS」裸跑熟悉流程，再逐步加 TLS 和 CDN。追求极致隐蔽可研究 VLESS + Reality 方案。

---

## 总结

| 步骤 | 关键操作 |
|------|----------|
| 1. 买 VPS | 选日本/新加坡机房，Ubuntu 系统 |
| 2. 装服务端 | 官方一键脚本安装 V2Ray |
| 3. 写配置 | VMess + WebSocket，生成 UUID |
| 4. 配客户端 | v2rayN/v2rayNG，填入相同参数 |
| 5. 测试 | 浏览器访问验证 |
| 6. 优化 | 套 TLS + CDN 提升稳定性与隐蔽性 |
| 7. 维护 | 改 SSH 端口、禁密码、开防火墙 |
