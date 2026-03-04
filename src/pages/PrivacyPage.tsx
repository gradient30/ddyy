import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playClick } from '@/lib/sound';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Shield, Lock, Eye, Database, Bell } from 'lucide-react';

/**
 * 隐私政策页面
 * 符合国内数据保护法规要求
 */
const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    playClick();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="touch-target-lg rounded-full"
            aria-label="返回"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">隐私政策</h1>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <ScrollArea className="h-[calc(100vh-140px)]">
          {/* 简介 */}
          <Card className="mb-6 border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">我们重视您的隐私</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    最后更新：2026年3月3日
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                道闸乐园（以下简称"我们"）非常重视用户的隐私和个人信息保护。
                本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
                请您在使用我们的服务前仔细阅读本政策。
              </p>
            </CardContent>
          </Card>

          {/* 信息收集 */}
          <Section
            icon={<Database className="w-5 h-5" />}
            title="我们收集的信息"
          >
            <InfoList items={[
              {
                title: '账户信息',
                content: '孩子的昵称、头像选择、年龄段偏好等基本信息。这些信息仅用于提供个性化的游戏体验。',
              },
              {
                title: '游戏数据',
                content: '学习进度、获得的星星、徽章、已学词汇等游戏内数据。这些数据存储在本地设备上。',
              },
              {
                title: '设置偏好',
                content: '语言设置、护眼模式、音效开关等用户偏好设置。',
              },
              {
                title: '设备信息',
                content: '设备类型、屏幕分辨率等基本信息，用于优化显示效果。',
              },
            ]} />
          </Section>

          {/* 信息使用 */}
          <Section
            icon={<Eye className="w-5 h-5" />}
            title="我们如何使用信息"
          >
            <InfoList items={[
              {
                title: '提供游戏服务',
                content: '使用您的信息来提供、维护和改进游戏功能。',
              },
              {
                title: '个性化体验',
                content: '根据年龄段和学习进度调整游戏难度和内容。',
              },
              {
                title: '家长监控',
                content: '为家长提供孩子的学习进度报告（仅限本地查看）。',
              },
            ]} />
          </Section>

          {/* 信息存储 */}
          <Section
            icon={<Lock className="w-5 h-5" />}
            title="信息存储与安全"
          >
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                我们采取多种安全措施保护您的信息：
              </p>
              <ul className="space-y-3">
                <SecurityItem
                  title="本地存储"
                  content="所有数据默认存储在您的设备本地，不会自动上传到服务器。"
                />
                <SecurityItem
                  title="数据加密"
                  content="敏感数据使用 AES-256-GCM 加密算法进行本地加密存储。"
                />
                <SecurityItem
                  title="无第三方共享"
                  content="我们不会将您的个人信息出售或分享给任何第三方。"
                />
                <SecurityItem
                  title="儿童隐私保护"
                  content="我们严格遵守儿童在线隐私保护法(COPPA)和相关规定。"
                />
              </ul>
            </div>
          </Section>

          {/* 家长控制 */}
          <Section
            icon={<Bell className="w-5 h-5" />}
            title="家长权利与控制"
          >
            <p className="text-muted-foreground leading-relaxed mb-4">
              作为家长，您拥有以下权利：
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>查看孩子的游戏进度和学习数据</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>调整年龄段设置和游戏难度</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>导出或删除所有本地数据</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>设置游戏时长限制和休息提醒</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>开启/关闭数据收集功能</span>
              </li>
            </ul>
          </Section>

          {/* 数据权利 */}
          <Section title="您的数据权利">
            <div className="grid gap-4 sm:grid-cols-2">
              <RightCard
                title="访问权"
                description="您可以随时查看存储在设备上的所有数据。"
              />
              <RightCard
                title="更正权"
                description="您可以修改或更新任何不准确的信息。"
              />
              <RightCard
                title="删除权"
                description="您可以要求删除所有个人数据。"
              />
              <RightCard
                title="导出权"
                description="您可以将数据导出为JSON格式。"
              />
            </div>
          </Section>

          {/* 联系我们 */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-2">联系我们</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                如果您对本隐私政策有任何疑问，或希望行使您的数据权利，
                请通过以下方式联系我们：
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">邮箱：</span>
                  <a href="mailto:privacy@barrierbuddies.com" className="text-primary hover:underline">
                    privacy@barrierbuddies.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">更新日期：</span>
                  <span>2026年3月3日</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 底部留白 */}
          <div className="h-8" />
        </ScrollArea>
      </main>
    </div>
  );
};

// 区块组件
interface SectionProps {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
  <Card className="mb-4">
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// 信息列表
interface InfoItem {
  title: string;
  content: string;
}

interface InfoListProps {
  items: InfoItem[];
}

const InfoList: React.FC<InfoListProps> = ({ items }) => (
  <div className="space-y-4">
    {items.map((item, index) => (
      <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
      </div>
    ))}
  </div>
);

// 安全项
interface SecurityItemProps {
  title: string;
  content: string;
}

const SecurityItem: React.FC<SecurityItemProps> = ({ title, content }) => (
  <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
    <div>
      <span className="font-medium text-sm">{title}</span>
      <p className="text-sm text-muted-foreground mt-0.5">{content}</p>
    </div>
  </li>
);

// 权利卡片
interface RightCardProps {
  title: string;
  description: string;
}

const RightCard: React.FC<RightCardProps> = ({ title, description }) => (
  <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
    <h4 className="font-semibold text-sm mb-1">{title}</h4>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

export default PrivacyPage;
