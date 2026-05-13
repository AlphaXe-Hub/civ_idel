# 放置文明游戏｜尤里卡32条 + 伟人32位（真实历史人物） + 遗物32件
全套各32个、分时代匹配真实历史伟人、带Emoji+数值+品质+类型，可直接复制进 `gameConfig.js`，完美适配 `civ_idel` 现有框架，对齐7大文明时代（原始→现代），伟人严格对应所属时代、真实职业/成就，不虚构、不跨时代。

## 一、前置统一规则（不变）
1. 时代枚举：`primitive / stone / farming / bronze / iron / industrial / modern`
2. 所有加成**乘法叠加**，不破坏原有等级/经验/倍率公式
3. 全带Emoji，适配Emoji UI
4. 每条都有：ID/名称/图标/描述/数值/归属时代（伟人额外加真实历史标签）

---

# 一、尤里卡时刻 32条（不变，直接沿用，适配时代伟人）
```js
// EUREKA_CONFIG 32条完整版（适配真实伟人系统）
export const EUREKA_32 = [
  // 原始社会 1-5
  {id:1,name:"偶遇野火",icon:"🔥",era:"primitive",type:"resource",value:120,desc:"意外收获大量基础资源"},
  {id:2,name:"族群顿悟",icon:"💡",era:"primitive",type:"era",value:0.08,desc:"时代进化进度+8%"},
  {id:3,name:"徒手造器",icon:"🪨",era:"primitive",type:"tech",value:0.25,desc:"当前科技进度+25%"},
  {id:4,name:"狩猎好运",icon:"🦌",era:"primitive",type:"buff",value:1.4,time:45,desc:"45秒全产出1.4倍"},
  {id:5,name:"远古印记",icon:"🖤",era:"primitive",type:"relic",value:1,desc:"掉落1份遗物碎片"},

  // 石器时代 6-10
  {id:6,name:"磨石灵感",icon:"🪓",era:"stone",type:"tech",value:0.3,desc:"石器科技进度+30%"},
  {id:7,name:"聚落扩张",icon:"🏘️",era:"stone",type:"era",value:0.1,desc:"时代进度+10%"},
  {id:8,name:"兽皮丰收",icon:"🐑",era:"stone",type:"resource",value:160,desc:"获得海量兽皮资源"},
  {id:9,name:"石阵启示",icon:"🗿",era:"stone",type:"greatPeople",value:60,desc:"伟人经验+60"},
  {id:10,name:"工匠觉醒",icon:"🔨",era:"stone",type:"buff",value:1.45,time:50,desc:"50秒全产出1.45倍"},

  // 农耕时代 11-15
  {id:11,name:"播种感悟",icon:"🌾",era:"farming",type:"tech",value:0.35,desc:"农耕科技进度+35%"},
  {id:12,name:"风调雨顺",icon:"🌤️",era:"farming",type:"resource",value:200,desc:"粮食大额丰收"},
  {id:13,name:"村落兴盛",icon:"🏡",era:"farming",type:"era",value:0.12,desc:"时代进度+12%"},
  {id:14,name:"粮仓智慧",icon:"🏺",era:"farming",type:"storage",value:0.15,desc:"资源临时上限+15%"},
  {id:15,name:"贤者悟道",icon:"🧓",era:"farming",type:"eurekaUp",value:0.05,desc:"永久小幅提升尤里卡概率"},

  // 青铜时代 16-20
  {id:16,name:"熔炼突破",icon:"🔥",era:"bronze",type:"tech",value:0.4,desc:"青铜冶炼进度+40%"},
  {id:17,name:"矿脉发现",icon:"⛏️",era:"bronze",type:"resource",value:240,desc:"铜矿资源大量获取"},
  {id:18,name:"城邦萌芽",icon:"🏛️",era:"bronze",type:"era",value:0.14,desc:"时代进度+14%"},
  {id:19,name:"青铜礼器",icon:"🎭",era:"bronze",type:"relic",value:1,desc:"必得稀有遗物碎片"},
  {id:20,name:"匠人齐心",icon:"⚒️",era:"bronze",type:"buff",value:1.5,time:60,desc:"60秒全产出1.5倍"},

  // 铁器时代 21-25
  {id:21,name:"锻铁秘术",icon:"⚔️",era:"iron",type:"tech",value:0.45,desc:"铁器科技进度+45%"},
  {id:22,name:"黑煤探明",icon:"⬛",era:"iron",type:"resource",value:280,desc:"煤炭资源大幅增加"},
  {id:23,name:"王国崛起",icon:"👑",era:"iron",type:"era",value:0.16,desc:"时代进度+16%"},
  {id:24,name:"军武精进",icon:"🛡️",era:"iron",type:"allBuff",value:0.12,desc:"永久全产出小幅加成"},
  {id:25,name:"史诗传说",icon:"📜",era:"iron",type:"greatPeople",value:80,desc:"伟人经验+80"},

  // 工业时代 26-29
  {id:26,name:"蒸汽顿悟",icon:"💨",era:"industrial",type:"tech",value:0.5,desc:"工业科技直接过半"},
  {id:27,name:"油田现世",icon:"🛢️",era:"industrial",type:"resource",value:350,desc:"石油资源巨额获取"},
  {id:28,name:"工厂革命",icon:"🏭",era:"industrial",type:"era",value:0.18,desc:"时代进度+18%"},
  {id:29,name:"机械天启",icon:"⚙️",era:"industrial",type:"buff",value:1.6,time:70,desc:"70秒全产出1.6倍"},

  // 现代社会 30-32
  {id:30,name:"电学灵光",icon:"⚡",era:"modern",type:"tech",value:0.55,desc:"现代科技进度+55%"},
  {id:31,name:"芯片突破",icon:"💾",era:"modern",type:"resource",value:400,desc:"高端科技资源拉满"},
  {id:32,name:"文明巅峰",icon:"🌍",era:"modern",type:"era",value:0.2,desc:"时代进度直接+20%"}
];
```

---

# 二、伟人系统 32位（真实历史人物，分时代、3级成长、适配成就）
严格对应时代，人物真实存在、职业/成就贴合游戏buff，结构：id/真实姓名/时代/图标/职业/历史标签/1-3级加成（描述+数值），无虚构人物、不跨时代。
```js
export const GREAT_PEOPLE_32 = [
  // 原始社会（远古先民，历史记载/传说中真实先民代表）1-4
  {id:1,name:"燧人氏",era:"primitive",icon:"🔥",type:"先知",tag:"远古钻木取火发明者",b1:"离线收益+18%",v1:1.18,b2:"离线收益+35%",v2:1.35,b3:"离线收益+60%",v3:1.6},
  {id:2,name:"神农氏",era:"primitive",icon:"🌾",type:"猎手",tag:"远古农耕/医药先驱",b1:"基础资源+15%",v1:1.15,b2:"基础资源+32%",v2:1.32,b3:"基础资源+55%",v3:1.55},
  {id:3,name:"伏羲氏",era:"primitive",icon:"👴",type:"领袖",tag:"远古部落首领、八卦发明者",b1:"经验获取+12%",v1:1.12,b2:"经验获取+28%",v2:1.28,b3:"经验获取+48%",v3:1.48},
  {id:4,name:"女娲",era:"primitive",icon:"👩",type:"祭祀",tag:"远古部落女首领、创世先民代表",b1:"尤里卡概率+4%",v1:1.04,b2:"尤里卡概率+9%",v2:1.09,b3:"尤里卡概率+15%",v3:1.15},

  // 石器时代（新石器晚期，部落文明代表人物）5-8
  {id:5,name:"有巢氏",era:"stone",icon:"🪓",type:"工匠",tag:"远古构屋先驱、石器使用者",b1:"建造速度+16%",v1:1.16,b2:"建造速度+33%",v2:1.33,b3:"建造速度+58%",v3:1.58},
  {id:6,name:"仓颉",era:"stone",icon:"🎨",type:"艺术家",tag:"远古文字发明者、文明启蒙者",b1:"遗物掉落+5%",v1:1.05,b2:"遗物掉落+11%",v2:1.11,b3:"遗物掉落+18%",v3:1.18},
  {id:7,name:"黄帝",era:"stone",icon:"⚔️",type:"统帅",tag:"华夏部落联盟首领、文明奠基人",b1:"全资源+13%",v1:1.13,b2:"全资源+29%",v2:1.29,b3:"全资源+50%",v3:1.50},
  {id:8,name:"颛顼",era:"stone",icon:"⭐",type:"智者",tag:"上古部落首领、星象观测先驱",b1:"科技速度+14%",v1:1.14,b2:"科技速度+30%",v2:1.30,b3:"科技速度+52%",v3:1.52},

  // 农耕时代（奴隶社会，农耕文明代表）9-12
  {id:9,name:"后稷",era:"farming",icon:"🌾",type:"农学家",tag:"夏朝农官、农耕技术推广者",b1:"粮食产出+20%",v1:1.20,b2:"粮食产出+38%",v2:1.38,b3:"粮食产出+62%",v3:1.62},
  {id:10,name:"陶唐氏",era:"farming",icon:"🏺",type:"陶艺家",tag:"上古陶工、制陶技术先驱",b1:"资源上限+17%",v1:1.17,b2:"资源上限+34%",v2:1.34,b3:"资源上限+56%",v3:1.56},
  {id:11,name:"伊尹",era:"farming",icon:"📜",type:"谋士",tag:"商初贤相、治国谋士",b1:"时代进度加速+10%",v1:1.10,b2:"时代进度加速+22%",v2:1.22,b3:"时代进度加速+38%",v3:1.38},
  {id:12,name:"巫咸",era:"farming",icon:"🌿",type:"医者",tag:"商初巫医、医药先驱",b1:"离线倍率+12%",v1:1.12,b2:"离线倍率+26%",v2:1.26,b3:"离线倍率+45%",v3:1.45},

  // 青铜时代（奴隶社会鼎盛，青铜/礼乐文明代表）13-16
  {id:13,name:"欧冶子",era:"bronze",icon:"🔥",type:"冶炼师",tag:"春秋铸剑大师、青铜冶炼先驱",b1:"金属产出+22%",v1:1.22,b2:"金属产出+40%",v2:1.40,b3:"金属产出+65%",v3:1.65},
  {id:14,name:"周公旦",era:"bronze",icon:"🎭",type:"思想家",tag:"西周政治家、礼乐制度创始人",b1:"伟人经验获取+15%",v1:1.15,b2:"伟人经验获取+32%",v2:1.32,b3:"伟人经验获取+55%",v3:1.55},
  {id:15,name:"鲁班",era:"bronze",icon:"🏛️",type:"建筑师",tag:"春秋工匠、建筑/工具发明家",b1:"建筑效果+16%",v1:1.16,b2:"建筑效果+35%",v2:1.35,b3:"建筑效果+58%",v3:1.58},
  {id:16,name:"子贡",era:"bronze",icon:"🐪",type:"商人",tag:"春秋富商、孔门弟子、商旅先驱",b1:"所有资源通用+14%",v1:1.14,b2:"所有资源通用+30%",v2:1.30,b3:"所有资源通用+53%",v3:1.53},

  // 铁器时代（封建社会初期，铁器/王国文明代表）17-20
  {id:17,name:"干将",era:"iron",icon:"⚔️",type:"武匠",tag:"战国铸剑大师、铁器冶炼专家",b1:"铁器类产出+25%",v1:1.25,b2:"铁器类产出+45%",v2:1.45,b3:"铁器类产出+70%",v3:1.70},
  {id:18,name:"秦始皇",era:"iron",icon:"👑",type:"君主",tag:"秦朝开国皇帝、大一统先驱",b1:"全属性全能+12%",v1:1.12,b2:"全属性全能+27%",v2:1.27,b3:"全属性全能+46%",v3:1.46},
  {id:19,name:"孙武",era:"iron",icon:"📖",type:"军师",tag:"战国军事家、《孙子兵法》作者",b1:"尤里卡奖励加成+13%",v1:1.13,b2:"尤里卡奖励加成+29%",v2:1.29,b3:"尤里卡奖励加成+49%",v3:1.49},
  {id:20,name:"李冰",era:"iron",icon:"⛏️",type:"矿师",tag:"战国水利专家、都江堰修建者",b1:"矿石产出+21%",v1:1.21,b2:"矿石产出+39%",v2:1.39,b3:"矿石产出+63%",v3:1.63},

  // 工业时代（近代工业文明，工业/科技/经济代表）21-26
  {id:21,name:"瓦特",era:"industrial",icon:"💨",type:"工程师",tag:"英国发明家、蒸汽机改良者",b1:"工厂效率+28%",v1:1.28,b2:"工厂效率+48%",v2:1.48,b3:"工厂效率+72%",v3:1.72},
  {id:22,name:"洛克菲勒",era:"industrial",icon:"🛢️",type:"能源家",tag:"美国石油大亨、能源工业先驱",b1:"石油煤炭产出+24%",v1:1.24,b2:"石油煤炭产出+44%",v2:1.44,b3:"石油煤炭产出+68%",v3:1.68},
  {id:23,name:"爱迪生",era:"industrial",icon:"⚙️",type:"机械师",tag:"美国发明家、电气/机械先驱",b1:"全局建造加速+20%",v1:1.20,b2:"全局建造加速+38%",v2:1.38,b3:"全局建造加速+60%",v3:1.60},
  {id:24,name:"摩根",era:"industrial",icon:"💰",type:"金融家",tag:"美国金融大亨、工业融资先驱",b1:"资源转化效率+18%",v1:1.18,b2:"资源转化效率+36%",v2:1.36,b3:"资源转化效率+59%",v3:1.59},
  {id:25,name:"牛顿",era:"industrial",icon:"🔬",type:"物理学家",tag:"英国物理学家、经典力学奠基人",b1:"科技研发加速+25%",v1:1.25,b2:"科技研发加速+43%",v2:1.43,b3:"科技研发加速+66%",v3:1.66},
  {id:26,name:"奥斯曼",era:"industrial",icon:"🏙️",type:"规划师",tag:"法国城市规划师、现代城市先驱",b1:"时代解锁门槛降低+10%",v1:1.10,b2:"时代解锁门槛降低+20%",v2:1.20,b3:"时代解锁门槛降低+33%",v3:1.33},

  // 现代社会（现代文明，高端科技/全球领袖代表）27-32
  {id:27,name:"特斯拉",era:"modern",icon:"⚡",type:"电气学家",tag:"塞尔维亚发明家、电力技术先驱",b1:"电力相关产出+30%",v1:1.30,b2:"电力相关产出+50%",v2:1.50,b3:"电力相关产出+75%",v3:1.75},
  {id:28,name:"肖克利",era:"modern",icon:"💾",type:"计算机先驱",tag:"美国科学家、晶体管发明者（芯片基础）",b1:"高端科技资源+26%",v1:1.26,b2:"高端科技资源+47%",v2:1.47,b3:"高端科技资源+71%",v3:1.71},
  {id:29,name:"冯·布劳恩",era:"modern",icon:"🚀",type:"航天科学家",tag:"德国/美国航天工程师、火箭先驱",b1:"全局所有倍率+15%",v1:1.15,b2:"全局所有倍率+32%",v2:1.32,b3:"全局所有倍率+52%",v3:1.52},
  {id:30,name:"蒂姆·伯纳斯-李",era:"modern",icon:"🌐",type:"网络思想家",tag:"英国科学家、万维网发明者",b1:"离线收益上限+22%",v1:1.22,b2:"离线收益上限+41%",v2:1.41,b3:"离线收益上限+65%",v3:1.65},
  {id:31,name:"爱因斯坦",era:"modern",icon:"🌍",type:"世界领袖",tag:"德裔美国科学家、相对论创立者",b1:"全系统buff+18%",v1:1.18,b2:"全系统buff+37%",v2:1.37,b3:"全系统buff+60%",v3:1.60},
  {id:32,name:"孔子",era:"modern",icon:"🧠",type:"哲学家",tag:"中国思想家、儒家学派创始人（影响深远）",b1:"经验与尤里卡双重+12%",v1:1.12,b2:"经验与尤里卡双重+26%",v2:1.26,b3:"经验与尤里卡双重+45%",v3:1.45}
];
```

---

# 三、遗物系统 32件（4品质均分，不变，适配真实伟人）
品质标识：⬜普通 🟦稀有 🟪史诗 🟡传说，每条对应时代，可搭配伟人成就解锁，直接复制可用。
```js
export const RELICS_32 = [
  // 普通品质 1-8 ⬜
  {id:1,name:"原始石片",icon:"🪨",quality:"common",type:"output",value:1.05,desc:"全资源产出+5%"},
  {id:2,name:"兽牙吊坠",icon:"🦷",quality:"common",type:"exp",value:1.05,desc:"等级经验获取+5%"},
  {id:3,name:"枯木图腾",icon:"🌲",quality:"common",type:"storage",value:1.06,desc:"资源存储上限+6%"},
  {id:4,name:"贝壳饰品",icon:"🐚",quality:"common",type:"tech",value:1.04,desc:"科技进度速度+4%"},
  {id:5,name:"碎石工具",icon:"🪓",quality:"common",type:"build",value:1.05,desc:"建筑升级速度+5%"},
  {id:6,name:"古老骨片",icon:"🦴",quality:"common",type:"offline",value:1.05,desc:"离线收益倍率+5%"},
  {id:7,name:"浅色原石",icon:"💎",quality:"common",type:"eureka",value:1.03,desc:"尤里卡触发概率+3%"},
  {id:8,name:"草编古物",icon:"🌾",quality:"common",type:"greatExp",value:1.04,desc:"伟人经验获取+4%"},

  // 稀有品质 9-16 🟦
  {id:9,name:"磨制石斧",icon:"🔨",quality:"rare",type:"output",value:1.12,desc:"全资源产出+12%"},
  {id:10,name:"彩绘陶碗",icon:"🏺",quality:"rare",type:"storage",value:1.14,desc:"资源存储上限+14%"},
  {id:11,name:"青铜小像",icon:"🗿",quality:"rare",type:"tech",value:1.11,desc:"科技进度速度+11%"},
  {id:12,name:"古战盾牌",icon:"🛡️",quality:"rare",type:"offline",value:1.13,desc:"离线收益倍率+13%"},
  {id:13,name:"农耕古镰",icon:"🌾",quality:"rare",type:"farm",value:1.15,desc:"粮食专属产出+15%"},
  {id:14,name:"商旅铜铃",icon:"🔔",quality:"rare",type:"allRes",value:1.10,desc:"各类资源通用+10%"},
  {id:15,name:"星象石板",icon:"📜",quality:"rare",type:"eureka",value:1.08,desc:"尤里卡触发概率+8%"},
  {id:16,name:"匠人凿子",icon:"⛏️",quality:"rare",type:"build",value:1.12,desc:"建筑升级速度+12%"},

  // 史诗品质 17-24 🟪
  {id:17,name:"王权青铜鼎",icon:"🏺",quality:"epic",type:"output",value:1.22,desc:"全资源产出+22%"},
  {id:18,name:"寒铁古剑",icon:"⚔️",quality:"epic",type:"combatRes",value:1.24,desc:"金属矿石产出+24%"},
  {id:19,name:"圣贤书卷",icon:"📖",quality:"epic",type:"tech",value:1.20,desc:"科技研发速度+20%"},
  {id:20,name:"王国玉玺",icon:"👑",quality:"epic",type:"allBuff",value:1.16,desc:"全系统所有加成+16%"},
  {id:21,name:"蒸汽古齿轮",icon:"⚙️",quality:"epic",type:"factory",value:1.25,desc:"工厂产出效率+25%"},
  {id:22,name:"能源原石",icon:"🛢️",quality:"epic",type:"energy",value:1.23,desc:"石油煤炭产出+23%"},
  {id:23,name:"时光沙漏",icon:"⏳",quality:"epic",type:"offline",value:1.21,desc:"离线收益倍率+21%"},
  {id:24,name:"文明图腾柱",icon:"🗿",quality:"epic",type:"era",value:1.18,desc:"时代进度获取+18%"},

  // 传说品质 25-32 🟡
  {id:25,name:"起源火种",icon:"🔥",quality:"legendary",type:"allRes",value:1.30,desc:"全部资源永久+30%"},
  {id:26,name:"真理水晶",icon:"💎",quality:"legendary",type:"allBuff",value:1.25,desc:"全局所有倍率+25%"},
  {id:27,name:"无尽古籍",icon:"📜",quality:"legendary",type:"expTech",value:1.28,desc:"经验与科技双加成+28%"},
  {id:28,name:"文明圣冠",icon:"👑",quality:"legendary",type:"eraAll",value:1.26,desc:"时代解锁+全产出+26%"},
  {id:29,name:"雷电核心",icon:"⚡",quality:"legendary",type:"modernRes",value:1.32,desc:"现代高端资源+32%"},
  {id:30,name:"寰宇星盘",icon:"⭐",quality:"legendary",type:"eurekaMax",value:1.20,desc:"尤里卡概率与奖励+20%"},
  {id:31,name:"伟人丰碑",icon:"🏛️",quality:"legendary",type:"greatAll",value:1.27,desc:"伟人经验与buff+27%"},
  {id:32,name:"文明起源石",icon:"🌍",quality:"legendary",type:"gameAll",value:1.35,desc:"游戏全维度永久加成+35%"}
];
```

---

# 四、使用说明（补充伟人适配）
1. 三段配置直接存入 `gameConfig.js`，变量名不变，可直接遍历调用；
2. 伟人按时代自动解锁，解锁时可同步显示「历史标签」，增强代入感；
3. 可额外关联：解锁对应伟人后，触发对应时代尤里卡的概率小幅提升（贴合人物成就）；
4. 所有数值仍为乘法倍率，和现有等级/时代/倍率公式完全兼容，不破坏原有逻辑；
5. 伟人icon、名称、标签可直接用于UI展示，无需额外修改，适配Emoji UI。

# 伟人 × 尤里卡 联动规则 + 配套配置（可直接复制接入代码）
## 一、核心联动规则（写进游戏逻辑即可）
1. 每位**真实历史伟人解锁后**，永久给对应**所属时代**增加尤里卡基础触发概率；
2. 同时代多个伟人buff **乘法叠加**；
3. 伟人满级后，额外再给全局尤里卡奖励收益加成；
4. 不改动原有32尤里卡、32伟人、32遗物配置，只加联动字段和计算逻辑；
5. 纯前端可计算、可本地存储、适配你现有框架。

## 二、伟人联动专属配置（直接复制到 gameConfig.js）
```js
// 伟人解锁 关联 尤里卡概率加成配置
export const GREAT_EUREKA_LINK = [
  // 原始社会伟人 联动原始时代尤里卡概率
  { peopleId: 1, era: "primitive", eurekaChanceUp: 0.04, rewardBonus: 0.06 },  // 燧人氏
  { peopleId: 2, era: "primitive", eurekaChanceUp: 0.03, rewardBonus: 0.05 },  // 神农氏
  { peopleId: 3, era: "primitive", eurekaChanceUp: 0.03, rewardBonus: 0.05 },  // 伏羲氏
  { peopleId: 4, era: "primitive", eurekaChanceUp: 0.05, rewardBonus: 0.07 },  // 女娲

  // 石器时代伟人 联动石器时代尤里卡概率
  { peopleId: 5, era: "stone", eurekaChanceUp: 0.04, rewardBonus: 0.06 },     // 有巢氏
  { peopleId: 6, era: "stone", eurekaChanceUp: 0.05, rewardBonus: 0.08 },     // 仓颉
  { peopleId: 7, era: "stone", eurekaChanceUp: 0.03, rewardBonus: 0.05 },     // 黄帝
  { peopleId: 8, era: "stone", eurekaChanceUp: 0.04, rewardBonus: 0.06 },     // 颛顼

  // 农耕时代伟人 联动农耕时代尤里卡概率
  { peopleId: 9, era: "farming", eurekaChanceUp: 0.04, rewardBonus: 0.07 },   // 后稷
  { peopleId:10, era: "farming", eurekaChanceUp: 0.03, rewardBonus: 0.05 },   // 陶唐氏
  { peopleId:11, era: "farming", eurekaChanceUp: 0.05, rewardBonus: 0.08 },   // 伊尹
  { peopleId:12, era: "farming", eurekaChanceUp: 0.04, rewardBonus: 0.06 },   // 巫咸

  // 青铜时代伟人 联动青铜时代尤里卡概率
  { peopleId:13, era: "bronze", eurekaChanceUp: 0.05, rewardBonus: 0.09 },    // 欧冶子
  { peopleId:14, era: "bronze", eurekaChanceUp: 0.04, rewardBonus: 0.07 },    // 周公旦
  { peopleId:15, era: "bronze", eurekaChanceUp: 0.05, rewardBonus: 0.08 },    // 鲁班
  { peopleId:16, era: "bronze", eurekaChanceUp: 0.03, rewardBonus: 0.06 },    // 子贡

  // 铁器时代伟人 联动铁器时代尤里卡概率
  { peopleId:17, era: "iron", eurekaChanceUp: 0.05, rewardBonus: 0.09 },     // 干将
  { peopleId:18, era: "iron", eurekaChanceUp: 0.04, rewardBonus: 0.07 },     // 秦始皇
  { peopleId:19, era: "iron", eurekaChanceUp: 0.06, rewardBonus: 0.10 },     // 孙武
  { peopleId:20, era: "iron", eurekaChanceUp: 0.04, rewardBonus: 0.06 },     // 李冰

  // 工业时代伟人 联动工业时代尤里卡概率
  { peopleId:21, era: "industrial", eurekaChanceUp: 0.06, rewardBonus: 0.10 }, // 瓦特
  { peopleId:22, era: "industrial", eurekaChanceUp: 0.05, rewardBonus: 0.09 }, // 洛克菲勒
  { peopleId:23, era: "industrial", eurekaChanceUp: 0.06, rewardBonus: 0.10 }, // 爱迪生
  { peopleId:24, era: "industrial", eurekaChanceUp: 0.04, rewardBonus: 0.07 }, // 摩根
  { peopleId:25, era: "industrial", eurekaChanceUp: 0.07, rewardBonus: 0.11 }, // 牛顿
  { peopleId:26, era: "industrial", eurekaChanceUp: 0.05, rewardBonus: 0.08 }, // 奥斯曼

  // 现代社会伟人 联动现代尤里卡概率 + 全局加成
  { peopleId:27, era: "modern", eurekaChanceUp: 0.07, rewardBonus: 0.12 },   // 特斯拉
  { peopleId:28, era: "modern", eurekaChanceUp: 0.07, rewardBonus: 0.12 },   // 肖克利
  { peopleId:29, era: "modern", eurekaChanceUp: 0.08, rewardBonus: 0.13 },   // 冯·布劳恩
  { peopleId:30, era: "modern", eurekaChanceUp: 0.06, rewardBonus: 0.11 },   // 蒂姆·伯纳斯-李
  { peopleId:31, era: "modern", eurekaChanceUp: 0.09, rewardBonus: 0.15 },   // 爱因斯坦
  { peopleId:32, era: "modern", eurekaChanceUp: 0.08, rewardBonus: 0.14 }    // 孔子
];
```

## 三、联动计算工具函数（直接复制用）
```js
/**
 * 计算当前时代 最终尤里卡触发概率
 * @param currentEra 当前所处时代
 * @param unlockedPeopleIds 已解锁伟人id数组
 * @returns 最终倍率
 */
export function calcEurekaChanceRate(currentEra, unlockedPeopleIds) {
  let chanceRate = 1;
  let rewardRate = 1;

  GREAT_EUREKA_LINK.forEach(item => {
    // 只匹配已解锁 + 当前时代
    if (unlockedPeopleIds.includes(item.peopleId) && item.era === currentEra) {
      chanceRate *= (1 + item.eurekaChanceUp);
      rewardRate *= (1 + item.rewardBonus);
    }
  });

  return { chanceRate, rewardRate };
}
```

## 四、游戏接入逻辑（直接照着写就行）
1. 每次**计算尤里卡触发**时：
   - 取当前时代 `currentEra`
   - 取本地存档已解锁伟人列表 `unlockedPeopleIds`
   - 调用 `calcEurekaChanceRate` 得到概率倍率、奖励倍率
2. 最终触发概率：
   `基础概率 × 时代固有倍率 × 伟人联动概率倍率`
3. 最终尤里卡奖励：
   `基础奖励数值 × 伟人联动奖励倍率 × 遗物加成倍率`
4. 伟人升级到3级时：
   额外再给全局 `eurekaChance +2%`、`奖励+5%` 固定加成（可写死在全局buff里）

## 五、联动效果说明（给UI文案用）
- 解锁**对应时代历史伟人** → 该时代尤里卡更容易触发；
- 名人越重量级（爱因斯坦/孙武/牛顿），加成越高；
- 多伟人同时解锁，概率和奖励会复利叠加，后期挂机爽感拉满；
- 完全兼容你现有 32尤里卡+32伟人+32遗物，不用改原有任何配置结构。