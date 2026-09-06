#!/usr/bin/env python3
"""Generate preschool-friendly neural voice clips with edge-tts."""
from __future__ import annotations

import asyncio
import hashlib
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "audio"
MANIFEST = ROOT / "src" / "data" / "audio-manifest.ts"

ZH_VOICE = "zh-CN-XiaoyiNeural"
EN_VOICE = "en-US-JennyNeural"
RATE = "-15%"
PITCH = "+0Hz"

ZH: list[str] = [
    "欢迎回来，我们去成长小路吧",
    "看一看、点一点、听一听",
    "想一想、比一比、说一说",
    "问为什么，自己试一试",
    "今天我们一起看、一起点。",
    "走完一站，小路会打开下一站。",
    "道闸是停车场的大门，它会抬起来让车过去。",
    "我们先学会观察和数数，再学安全。",
    "每到一站，先想“为什么”，再动手。",
    "不同地方的大门不一样，但都是为了安全。",
    "先装一个稳稳的底座",
    "竖起坚固的立柱",
    "安装电机，给道闸力量",
    "装上长长的杆子",
    "装传感器，能看到车来了",
    "装上红绿灯，更安全",
    "安装控制面板",
    "最后涂上漂亮的颜色！",
    "太棒了！道闸建好了！",
    "你自己组装了一个道闸！太厉害了！",
    "先选一个零件！",
    "太棒了！道闸组装完成！你是小小工程师！",
    "这个位置不对，再想想！",
    "零件全部找到！现在来组装道闸吧！",
    "你的眼睛越来越亮啦",
    "点击道闸的每个部位，认识道闸的身体吧！",
    "太棒了！你认识了道闸的所有部位！",
    "用手指把小手拖远一点，看看用力会不会变小？",
    "发现了！推的地方离支点越远，越省力！道闸的长杆就是这样工作的。",
    "点击太阳，给电池充电！看看电机能不能转起来？",
    "充满了！太阳能给电机充电，电机转起来，道闸升起来！",
    "试试点挡住按钮，看看道闸会怎样？",
    "有东西挡住了！道闸停下来，保护安全！",
    "太棒了！传感器就像道闸的小眼睛，发现障碍物就会停下来！",
    "欢迎来到探秘实验室！选一个实验开始探索吧！",
    "你已经会先猜再试啦",
    "猜对了！你真像小科学家！",
    "没关系，做实验看看真正的答案！",
    "太棒了！车停好了，道闸升起来啦！",
    "再试试，把车拖到蓝色停车位里",
    "对了！红灯停！",
    "对了！绿灯行！",
    "对了！黄灯要减速！",
    "再想想，这个灯是什么意思？",
    "数一数，再试试",
    "太棒了！下雨天慢慢走，安全过马路！",
    "太棒了！安全过斑马线啦！",
    "太棒了！安全驾驶小达人！",
    "你已经会保护自己过马路啦",
    "答对了！你真会思考！",
    "再想想为什么呢？",
    "太棒了！数感小岛又长大一格！",
    "再数一遍，慢慢来",
    "数一数",
    "比多少",
    "认形状",
    "找规律",
    "来了与走了",
    "好漂亮的作品！",
    "语言小屋的本领收进手册啦",
    "再听一次",
    "顺序不对",
    "节拍稳住了，收进成长手册啦",
    "你会听故事，也会做选择",
    "答对了！真聪明！",
    "再想想哦！",
    "这是杆臂，长长的红白杆子，用来挡住车辆",
    "这是电机，圆圆的发动机，让杆臂上下运动",
    "这是传感器，红色小眼睛，感应有没有车",
    "这是底座，稳稳站住的大脚",
    "这是信号灯，红灯停、绿灯行",
    "道闸长啥样？。点击各部位，认识道闸的身体",
    "杠杆魔法。挪动小手的位置，感受省力",
    "电机与太阳能。让电机转起来，太阳能充电",
    "传感器安全。红外线就像小眼睛",
    "先猜一猜！你觉得道闸有几个主要部件？",
    "先猜一猜！小手离支点更远的地方去推，会怎么样？",
    "先猜一猜！太阳能板能给电机充电吗？",
    "先猜一猜！如果有东西挡住传感器，道闸会？",
]

for name in ("小狮", "小兔", "小熊"):
    ZH.extend([
        f"{name}，你好呀！我是小闸闸。",
        f"{name}，欢迎回来！",
        f"{name}，今天你是小小研究者。",
    ])

for part in (
    "螺栓", "齿轮", "弹簧", "电线", "控制板", "LED灯", "杆臂", "感应器",
    "电池", "太阳能板", "铰链", "油漆桶", "摄像头", "芯片", "标志牌", "线缆",
):
    ZH.append(f"找到了{part}！")
    ZH.append(f"{part}放对了！")

ZH.extend([
    "红", "绿", "黄", "蓝", "圆", "方", "大", "小", "上", "下", "开", "关",
    "停", "行", "车", "门", "安全", "太阳",
])

ZH.extend([
    "小区门口最常见的道闸，杆子直直的，像一只手臂！",
    "商场停车场的道闸上有广告屏幕，好酷！",
    "地下停车场用折叠杆，空间小也能用！",
    "用太阳能发电的道闸，环保又聪明！",
    "高速公路收费站用的超长围栏道闸！",
    "野生动物保护区用手动杆子，保护动物！",
    "机场用的智能翻板，刷卡就通过！",
    "巴西人喜欢给道闸涂上漂亮颜色！",
    "火车来了道闸会放下来，保护行人安全！",
    "从地面升起的柱子，保护古城步行街！",
    "摄像头看一眼车牌就自动开门！",
    "金字塔景区门口也有道闸哦！",
    "冬天太冷，道闸会自己加热不结冰！",
    "不用停车，开过去自动扣费！",
    "邻居们一起用的社区大门道闸！",
])

ZH.extend([
    "小兔开车来到停车场，前面有两个道闸，一个亮着绿灯，一个亮着红灯。",
    "绿灯亮了，道闸缓缓升起，小兔安全通过了！小兔开心地说：\"绿灯行，真安全！\"",
    "红灯亮着，道闸紧紧关着。小兔等了一会儿...",
    "小兔耐心等待，绿灯亮了！道闸升起，小兔安全通过。\"耐心等待是对的！\"",
    "哎呀！道闸没开，车被挡住了。小闸闸说：\"红灯要停下来哦！再试一次吧！\"",
    "小区的道闸坏了！车子们排着长队。小熊决定帮忙修理。先检查哪里？",
    "小熊发现电机没电了！需要给它充电。用什么充电呢？",
    "传感器很正常，小红外线灯在一闪一闪。问题不在这里，去检查电机吧！",
    "阳光照在太阳能板上，电慢慢充满了！道闸又能动了！小熊是最棒的小工程师！",
    "小熊使劲摇啊摇，发出了一点点电！道闸动了一下。但太慢了...要不试试太阳能？",
    "小猫溜进了停车场，看到好多有趣的东西！先去看看什么？",
    "哇！道闸一会儿升一会儿降，像在跳舞！小猫看得入迷了。突然一辆车开过来...",
    "小猫数了数：1、2、3...一共有5辆车！红色的、蓝色的、白色的，好多颜色！",
    "小猫跳到安全区，车安全通过了。保安叔叔说：\"小猫真聪明，知道站在安全的地方！\"",
    "传感器发现了小猫！道闸立刻停了下来！保安叔叔把小猫抱到安全的地方。\"以后要注意安全哦！\"",
    "今天是道闸乐园的\"美化日\"！小闸闸想换个新颜色。选什么颜色呢？",
    "小闸闸穿上天空蓝的新衣服，像蓝天一样好看！要不要加一些装饰？",
    "哇！七种颜色的道闸，太漂亮了！红橙黄绿蓝靛紫，像一道彩虹！所有人都来拍照！",
    "蓝色道闸上贴满了金色星星，晚上还会一闪一闪！小朋友们都说：\"好像星空！\"",
    "简简单单的天空蓝，清清爽爽。小闸闸说：\"有时候简单也很美！\"",
    "今天是道闸运动会！三个道闸比赛：直臂闸、折臂闸、围栏闸。你帮谁加油？",
    "直臂闸\"嗖\"地一下就升起来了！速度最快！但是它太长了，差点碰到旁边的树...",
    "折臂闸优雅地折叠升起，不占地方！虽然慢一点，但很安全。所有人鼓掌！",
    "调整好角度后，直臂闸完美升起！快又安全！裁判说：\"速度和安全都很重要！\"",
])

for opt in (
    "绿灯安全可以走", "红灯也能走", "耐心等待最安全", "冲过去更快",
    "可能是电机没电了", "可能是传感器坏了", "太阳能最环保", "手摇也不错",
    "赶紧到安全区", "继续看没关系", "直臂闸又直又快", "折臂闸更灵活",
):
    ZH.append(f'你选了"{opt}"，好有想法！')

for n in range(1, 11):
    ZH.append(f"对了！一共有{n}辆车！")

EN: list[str] = [
    "red", "green", "yellow", "blue", "circle", "square", "big", "small",
    "up", "down", "open", "close", "stop", "go", "car", "gate", "safe", "sun",
    "The most common barrier at Chinese communities!",
    "Mall barriers with LED advertising screens!",
    "Folding arms for underground parking!",
    "Solar-powered barriers, eco-friendly!",
    "Extra-long fence barriers at highway tolls!",
    "Manual barriers protect wildlife reserves!",
    "Smart flip gates at airports!",
    "Brazilians love colorful barriers!",
    "Railway barriers protect pedestrians!",
    "Rising bollards protect old town streets!",
    "Cameras read plates to open automatically!",
    "Even the Pyramids have barriers!",
    "Self-heating barriers for cold winters!",
    "Drive through, auto-pay electronically!",
    "Community shared neighborhood gates!",
]


def key_for(lang: str, text: str) -> str:
    digest = hashlib.md5(f"{lang}|{text}".encode("utf-8")).hexdigest()[:12]
    folder = "zh" if lang.startswith("zh") else "en"
    return folder, digest


async def synth_one(sem: asyncio.Semaphore, lang: str, voice: str, text: str, out: Path) -> bool:
    if out.exists() and out.stat().st_size > 400:
        return True
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, voice, rate=RATE, pitch=PITCH)
                await comm.save(str(out))
                return out.exists() and out.stat().st_size > 400
            except Exception as exc:
                await asyncio.sleep(0.8 * (attempt + 1))
                last = exc
        print(f"FAIL {lang}: {text[:40]} ({last})")
        return False


async def main() -> None:
    (PUBLIC / "zh").mkdir(parents=True, exist_ok=True)
    (PUBLIC / "en").mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(6)
    jobs = []
    mapping: dict[str, str] = {}

    seen = set()
    for text in ZH:
        text = text.strip()
        if not text or text in seen:
            continue
        seen.add(text)
        folder, digest = key_for("zh-CN", text)
        rel = f"audio/{folder}/{digest}.mp3"
        mapping[f"zh-CN|{text}"] = rel
        jobs.append(synth_one(sem, "zh-CN", ZH_VOICE, text, ROOT / "public" / rel))

    seen_en = set()
    for text in EN:
        text = text.strip()
        if not text or text in seen_en:
            continue
        seen_en.add(text)
        folder, digest = key_for("en-US", text)
        rel = f"audio/{folder}/{digest}.mp3"
        mapping[f"en-US|{text}"] = rel
        jobs.append(synth_one(sem, "en-US", EN_VOICE, text, ROOT / "public" / rel))

    results = await asyncio.gather(*jobs)
    ok = sum(1 for r in results if r)
    print(f"generated {ok}/{len(results)} clips")

    body = json.dumps(mapping, ensure_ascii=False, indent=2)
    MANIFEST.write_text(
        "/** lang|text → mp3 path under public/. Generated by scripts/generate-voice.py */\n"
        f"export const AUDIO_MANIFEST: Record<string, string> = {body};\n",
        encoding="utf-8",
    )
    print(f"wrote {MANIFEST} with {len(mapping)} entries")


if __name__ == "__main__":
    asyncio.run(main())
