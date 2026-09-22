# rust-apprentice 项目评估与接手实施计划

评估日期：2026-09-22。评估基线：`e229888`。下方评估保留原始结论；实施进度以本文末尾的交接记录和任务勾选为准。

## 1. 结论与预期

**部分达到预期：已经形成结构完整、理念清晰的教学 Skill 原型，但尚不足以认定为经过验证、可长期可靠使用的工程学徒系统。**

以 README 声明的目标为准：三个入口，初始化后自动续接，以实际表现更新学习状态，学员自己写代码，项目驱动选课，长期保持较低上下文成本，并支持 Windows/macOS/Linux。项目交付物是 Markdown 驱动的 agent 行为协议，不是 Rust 应用；缺少 Cargo 工程、数据库或服务本身不是缺陷。

当前优点：

- init / continue / status 职责明确，入口与参考材料分离，相对链接检查通过。
- 反依赖教学、提示阶梯、主动回忆、能力证据、逐步移交自主权的设计相互配合。
- Rust 与系统工程资料覆盖面广，已有课程依赖和项目路由，而不是只有语法目录。
- 工作区发现、热温冷状态、中文交流与英文文件、Windows 编码处理均有明确设计。
- 已有 27 个行为场景目录和 Windows/Linux 静态 CI，具备继续工程化的基础。

主要不足是规范内部一致性、持久状态可靠性和行为评测有效性，而不是资料数量。继续扩大课程之前，应先完成下面的 P0/P1。

| 产品预期 | 当前判断 | 依据与边界 |
| --- | --- | --- |
| 三入口可被分发工具发现 | 已验证 | Skills CLI 实际发现三个 Skill；不等同于真实客户端交互验证 |
| 资料结构、格式与链接正确 | 基本达到 | 现有静态检查全部通过，但未校验状态示例语义 |
| 每次只教一步，避免代写 | 设计较完善，效果未证实 | 有规则和 graders，本次未执行模型行为评测 |
| 自动续接、证据更新、复习调度 | 尚未充分达到 | 有冲突规则，缺少可重复的写入和跨会话验证 |
| 长期上下文成本有界 | 方向正确，保证不足 | 历史夹具不充分；归档阈值和日志顺序存在漏洞 |
| 跨平台稳定安装与使用 | 部分验证 | Windows 上三个检查通过；安装生命周期与真实教学未验证 |
| 最终培养独立工程师 | 尚无法判断 | 需要多会话乃至真实学员的长期证据，静态测试无法证明 |

## 2. 本次实测与限制

环境：Windows / PowerShell，Node `v26.1.0`，Claude Code `2.1.270`。检查开始时工作树干净。

| 命令或检查 | 结果 |
| --- | --- |
| `node tests/repo-checks.mjs` | 55/55 通过 |
| `node tests/validate-skills.mjs` | 三个 Skill 全部通过 |
| `node tests/assert-discovery.mjs` | 正确发现三个 Skill |
| `claude plugin --help`、`claude plugin eval --help` | 本机确实提供 eval；scaffold 默认关闭，需要 `--scaffold` |
| 行为结果目录 | 本地未发现 `evals/results/`，不能据此断言作者从未执行评测 |
| 完整模型评测、真实学员体验、安装卸载 | 本次未执行，不报告通过率或教学成效 |

两项 npx 检查出现 Node DEP0190 警告：Windows 下 `shell: true` 拼接参数需要处理，路径含空格时尤其应补回归。退出码仍为 0。

首次 PowerShell 默认解码显示乱码；显式 UTF-8 读取正常。这不构成仓库文件损坏证据。

外部核对仅用于客户端兼容性：当前 [Claude Code Skills 官方文档](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill) 表示 `disable-model-invocation: true` 仍允许用户手动调用。仓库所记载的相反实验结论应附版本和复现条件，不能直接外推到当前所有客户端。本文没有实际复测该开关。

## 3. 已发现的问题

### F01 / P0：状态值与示例不一致

- `skills/rust-learn-continue/references/core/learner-model.md:44`、`skills/rust-learn-init/assets/learner-model.template.yaml:81` 和七份 scaffold 使用 `state: developing`。
- `docs/state-schema.md` 与 mastery-model 的合法集合没有该值。
- 模板扩展名为 `.yaml`，内容却是 Markdown 和多个 fenced YAML 块，不能作为普通 YAML 模板直接解析。
- 影响：agent 可能复制非法状态；现有静态检查仍然全绿。

### F02 / P0：行为评测前置条件与评分不匹配

- `evals/ownership-struggle/prompt.md:7` 只声明 Read/Glob/Grep，`graders/state-updated.md` 却要求实际写入证据；eval README 也明确说用例只读。
- 多个 continue 用例没有提供工作区夹具。遵守产品规则而请求初始化，可能反而被教学 grader 判失败。
- README 的整套评测命令不含 `--scaffold`；本机 help 明确说明 `--trust-plugin` 不会开启 scaffold。
- `context-year-of-history/scaffold.sh` 实际只有少量会话、证据和 40 份短笔记，没有一年规模的历史。
- scaffold 在子目录创建工作区；必须验证 harness 的实际 cwd 或注册表配置能让规定的向上发现流程找到它，不能假定递归搜索子目录是正确行为。
- ownership-struggle 的示例函数未提供编译诊断，代码看起来本身可编译。后续应以 rustc 结果确认，避免评分器奖励虚构借用错误。

### F03 / P0：版本检查不能可靠触发迁移

- continue 入口第 49 行只检查 `rust-apprentice/` 前缀，所以未知未来 `/2` 也能进入正常流程。
- migration 文档则要求缺失或不同版本先迁移，并讨论同为 `/1` 但缺少 learner model 的旧结构。
- 影响：入口可能跳过结构修复；未来版本也不应被旧代码自动降级。

### F04 / P1：复习调度存在多套答案

- `core/review.md` 的第一次成功间隔是 3 天；`core/state-format.md` 和 `docs/state-schema.md` 是 7 天。
- review 文档写三次独立成功即可退休，后面的表格又写第四次及以后退休；state-format 对第三次成功安排 21 天。
- `Attempts` 没有清晰区分总尝试、连续成功和跨会话成功次数。
- 影响：相同学习表现可能得到不同计划，无法稳定测试。

### F05 / P1：日志与热状态的长期有界性不完整

- state-format 的日志例子是最新在前；workspace 却要求读取最后约 20 行，可能读到最旧记录。
- 超过约 150 行时只归档 30 天以前的条目；30 天内高频使用仍可无限超过阈值。
- review queue 的 Retired 列表长期累积也会膨胀。
- profile 被列为温状态，但 continue 和其他文档要求每次读取，且可持续累积 observations。
- learner-model 说不包含 `updated` 以外日期、概念列表，实际示例又有 `stage_since`、strengths/active/weak 项；需定义允许的紧凑摘要与硬上限。
- current 同时存在于 progress 和 learner model，缺少中途写入失败后的权威来源与修复顺序。

### F06 / P1：调用策略的历史结论被写成永久测试规则

- architecture 和测试把 `disable-model-invocation` 等同于“不注册命令”，未给客户端版本或可复现记录。
- 当前官方文档与该结论不同；这是待复测的兼容性问题，不能只凭文档或旧实验一方直接判定。
- 产品同时支持自然语言明确请求与 slash 调用。不可为修复误触发而直接禁止前者。
- portable 格式验证、客户端专用扩展、真实调用行为应分开判断。

### F07 / P1：安装更新过程存在失败后丢失旧版本的风险

- 两个安装脚本都是先删除目标 Skill 目录再复制新文件，没有 staging、备份与回滚。
- PowerShell 路径操作主要使用 `-Path` 而非 `-LiteralPath`；含方括号等字符的路径需要实测。
- 缺少安装、覆盖更新、重复安装、卸载、复制失败恢复、其他 Skill 保留的自动测试。
- 本次没有执行破坏性路径测试，此项根据代码顺序判断风险，并非已发生的数据丢失。

### F08 / P2：发布说明及测试维护性

- README 推荐命令仍有 `<owner>` 占位，脚本、manifest 和测试注释仍残留 two skills 的描述。
- discovery 使用 `skills@latest`，外部 CLI 输出变化会让同一提交产生不同结果。
- 当前静态检查侧重存在性与文本匹配，包含重复检查，不能拦截上述语义问题。
- status 在用户明确要求继续时直接教学，未明确加载 continue 的完整教学、记录与复习协议；应验证交接。
- 注意：Skill 的 `allowed-tools` 是预授权列表，不是工具禁用列表，不能把 status 的 Read/Glob/Grep 错判为“绝对不能写入”。

## 4. 实施约束

1. 保留三个入口、文件式学习工作区和按需加载设计；不引入 Web 平台、数据库、后台服务或额外用户命令。
2. 产品 Skill、模板、脚本保持英文；用户交流可以中文。本中文交接文档不改变产品语言约定。
3. 测试工作区、注册表、安装目标全部隔离在临时目录，不使用真实学习记录或个人 Skill 安装目录。
4. 优先修正协议并增加开发期验证；只有确定需要时才增加随 Skill 分发的小型辅助脚本，不能让所有学员被迫安装 Node/Python。
5. 不把概率性模型行为描述成确定性保证；基础设施失败、规则失败、教学评分分别记录。
6. 不以降低 grader 标准掩盖缺失状态、没有加载 Skill 或工具未获授权的问题。
7. 不把模拟会话成功视为培养独立工程师的证据；真实教育效果单独验证。

## 5. 按依赖实施的任务包

每个任务完成后更新勾选项、记录验证命令与结果；无法执行的检查说明原因。未勾选项不能视为完成。

### T1 / P0：统一状态契约

依赖：无。对应 F01、F03，以及 F05 的镜像一致性。

- [x] 以 mastery-model 为唯一状态词汇来源，统一 domain ID、stage、independence、git_level 的语义。
- [x] 审查每个 `developing` 示例，按已有证据选择合法状态；不是盲目全局替换为同一个级别。
- [x] 将 learner-model 模板明确为 Markdown 模板，或拆出真正可解析的单份 YAML 模板；同步所有链接和创建说明。
- [x] 指定规范的权威来源，说明 progress.current 与 learner-model.current 的同步规则、恢复规则和自定义 marker 路径的优先级。
- [x] 版本分支明确为：当前且结构完整、已知旧版/同版本缺字段、损坏、未知未来版本。未知未来版本停止修改并给出兼容性提示。
- [ ] 迁移与初始化可重入；备份名避免同日覆盖；保留证据和笔记，处理初始化中断。
- [x] 新增 `tests/state-contracts.mjs`（建议名称）和隔离 fixtures；必要时增加开发依赖清单及锁文件用于可靠解析 YAML。

涉及：docs/state-schema、core/learner-model、mastery-model、state-format、state-migration、workspace、三个入口、init assets/bootstrap、eval scaffolds。

验收：所有样例和生成夹具可解析；非法状态、缺字段、越界 marker 路径、未来版本能被识别；修复可重复且不覆盖证据。测试必须包含会失败的反例，不能只检查字符串出现。

### T2 / P0：修复评测可执行性和评分可信度

依赖：T1。

- [ ] 为 27 个现有用例建立清单：输入、工作区前提、cwd、所需工具、是否写入、检查对象、关键失败条件。
- [x] 用共享 fixture builder 替代七份重复 scaffold 主体；每个场景单独设置当前目标、证据、复习与项目文件。
- [ ] 只读对话用例与隔离写入用例分组。写入用例授予 harness 所需工具，在具备 sandbox 的运行环境执行。
- [x] 提供运行入口/说明，正确启用 scaffold；缺少前置条件时明确报 infrastructure failure，不能默默用空目录跑完。
- [x] 明确工作区根 cwd 或隔离注册表；确保不会读到测试机器上的真实注册表。
- [x] 增加模型实际加载目标 Skill 的证据检查，不能只因回答像老师就通过。
- [ ] 状态更新用例检查前后文件差异和内容；只读 status 用例检查零写入；读取预算检查工具轨迹和实际读取量。
- [x] 编译 ownership 用例的 Rust 片段；若合法，则改成“质疑错误前提并索要诊断”的用例，另增真实编译失败用例。
- [ ] 整理通过率、逐项 verdict、CLI/model 版本、日期、提交、运行次数和失败原因。报告默认只存本地，使用 `--no-publish`。（smoke 层面已达成：runner 记录版本元数据并审计报告；29×3 全量运行仍未完成）

涉及：evals 全部场景、graders、scaffold、evals/README、README、tests/eval-contracts.mjs（建议）。

验收：27 个场景均有有效前置条件；写入 grader 能实际观察写入；无 workspace 时有单独的正确提示用例；故意不加载 Skill、越界读取或伪造状态应失败。先执行少量 smoke，再扩展，避免在无效夹具上消耗模型调用。

### T3 / P1：形成跨会话学习闭环

依赖：T1、T2。

- [ ] 将 review.md 作为调度规则的单一权威来源，统一首次成功间隔、退休条件、失败重置及 attempts 定义。建议默认保留文档摘要中的 7/7/21 天方案，退休要求单独明确，记录该产品选择。
- [ ] 用给定当前日期测试调度，覆盖首次成功、部分成功、连续失败、跨月成功、退休后再次失败，不依赖运行当天碰巧满足条件。
- [ ] 明确证据发生后必须更新哪些文件，以及会话结束时 log/session/registry 的更新要求，避免可选参考文档导致漏记。
- [ ] 模拟中断：写入 evidence 后未更新摘要、镜像只更新一个、一天内多个会话。恢复时不虚构观察、不重复计数、不覆盖前一会话。
- [ ] 补齐 init → continue → 学员提交尝试 → 记录 → 新会话恢复 → status → 用户要求继续的串联场景。
- [ ] status 转 continue 时加载需要的教学协议和状态；仅查看状态不自动迁移或改写学习记录，修复需求明确交接。

验收：至少三条多会话轨迹（新手、已有编程经验、反复受阻）可重复执行；下一次会话正确续接；不把 agent 自己的解释记录成学员能力；仅问候或查看状态无无关写入。

### T4 / P1：证明长期上下文成本有界

依赖：T1、T2，可与 T3 分别推进但统一状态规则。

- [ ] 统一日志为最旧在前、最新追加，读取末尾；同步模板、fixtures、说明和检查。
- [ ] 规定明确预算：progress 不超过 60 行、learner model 目标不超过 120 行、活跃 review 项不超过 20、热状态内容合计目标不超过 400 行。若实测需要调整，记录原因，不能静默放宽。
- [ ] 按数量上限归档日志；不能只依赖 30 天窗口。归档 retired 条目和 profile 历史观察，同时保留定位指针。
- [ ] 为测试生成真实体量：365 份会话、千条证据、数百笔记、超阈值日志和退休项目；包括 30 天内高频记录的反例。
- [ ] 量化实际读取文件、字节/行数及可获得的 token 数据；分别报告产品热状态与 Skill/参考材料开销。
- [ ] 对比新工作区与大历史工作区；普通续接不得为了找当前目标读取历史，明确询问细节时允许有界定向读取。

验收：历史规模增长时，普通启动的读取集合不增长到历史集合；最多一个 domain 加一个必要 topic；归档前后记录无损；大量近期事件仍能满足热状态上限。

### T5 / P1：验证客户端调用与分发兼容性

依赖：T2。

- [ ] 在隔离客户端配置中记录版本，验证个人 Skill、项目 Skill、plugin 三种安装方式的实际命令名和引用路径。
- [ ] 对无标志和 `disable-model-invocation: true` 分别验证用户 slash 调用、自然语言明确学习请求、普通 Rust 编程请求、随口提到 Rust。
- [ ] 结合产品“明确学习请求即可启动”的约定决定是否保留当前 description 策略；不要单凭官方说明机械添加开关。
- [ ] 把历史 bug 改为有版本和环境的兼容性记录；移除“所有版本必然不注册”的断言。
- [ ] 分开验证 portable frontmatter 和客户端扩展；若选择生成客户端专用配置，生成结果也要被实际安装测试覆盖。
- [ ] 说明三个 Skill 需一起安装，跨目录参考存在依赖；plugin 命名空间与个人安装命令分别写清。

验收：上述调用矩阵有可核查记录；普通代码任务不触发教学流程；明确学习请求在声明支持的方式下能启动；文档与实际安装命令一致。

### T6 / P1：安装、更新和卸载可靠性

依赖：无；合并前需要 T5 的分发约定。

- [ ] 安装前解析目标绝对路径，拒绝目标与源目录重叠等会删除源文件的配置；处理 symlink/junction，不递归跟随删除其他目录。
- [ ] 先复制到同父目录的 staging 并验证，再切换安装；保留可恢复备份，失败回滚。卸载仅涉及三个已识别的 Skill。
- [ ] PowerShell 文件操作使用 LiteralPath，正确处理中文、空格、方括号；不要仅靠 quoting 假设有效。
- [ ] 测试首次安装、重复安装、更新移除旧文件、复制失败、缺失源文件、卸载幂等性；确认其他 Skill 和学习工作区不变。
- [ ] 覆盖 PowerShell 5.1/7 与 POSIX shell；macOS 实测前不宣称已验证。

验收：全部文件操作限定在临时测试目录；故障后旧安装可恢复；不会出现三个 Skill 只有一部分更新成功而被报告全部成功。

### T7 / P2：发布门槛、文档与持续验证

依赖：T1–T6。

- [ ] 清理 two/three、owner 占位、模板扩展名、plugin 描述和日志示例等漂移。
- [ ] 固定验证工具版本；另设非阻断的 latest 兼容性检查，避免基础验证随外部发布变化。
- [ ] 修复 Windows 子进程调用和空格路径处理；清理重复静态检查，接入状态与 eval 契约检查。
- [ ] CI 默认执行离线契约/夹具/安装检查；有凭证的行为评测独立触发，报告缺少凭证而非伪通过。
- [ ] 新增版本化评估摘要，记录关键失败、原始报告位置、隐私处理和可复现命令；不提交真实学员私密材料。
- [ ] README 区分“设计目标”“模拟评测已验证”“尚需实际学员验证”，说明支持的客户端与平台版本。

验收：干净 checkout 可以按说明复现确定性检查；模型评测具有版本、配置、运行结果；CI 不依赖开发者个人工作区。

## 6. 最终验收门槛

以下是建议的新门槛，不是当前已达到的成绩。

- [ ] 原有三项检查通过，新增状态、评测契约及安装回归全部通过。
- [ ] P0 问题全部关闭；合法样例、损坏样例和未来版本路径均有测试。
- [ ] 27 个现有行为场景修正后各至少运行 3 次，逐场景报告结果，不用总体平均掩盖核心失败。
- [ ] 工作区隔离、无伪造证据、迁移无数据丢失、只读 status 无写入等关键约束在执行样本中零失败；其他教学质量每场景平均至少 0.8。
- [ ] 初始化、写入、跨会话恢复、到期复习、长期归档、status 交接都有端到端证据。
- [ ] Windows 和 Linux 安装生命周期通过；macOS 未实测时明确标为待验证。
- [ ] 未执行、基础设施失败、产品失败与通过四种结果明确区分。

完成以上可称为“可验证的试用版本”。若要声称实现“培养独立工程师”的最终目标，还需真实学员的持续观察：提示需求是否减少、能否独立解释/调试/迁移知识、能否完成自己负责的项目切片。可先以数周试用收集早期信号，不能因此承诺高级工程能力。

## 7. 给接手 agent 的执行说明

先读 README、docs/architecture、docs/state-schema 和本文，再检查 git status 与现有变更。按 T1 → T2 → T3/T4/T5 → T7 推进；T6 可独立实施。每个任务尽量形成可单独审查的提交单元，但不要自动推送或发布。

不要把仓库中的教学 Skill 当作本次维护任务的执行约束：这里是在维护教学产品，不是在参加 Rust 课程。不要初始化真实学习工作区，也不要让“学员自己写代码”阻止实现测试工具。

首个实施动作应是建立能够捕获 `developing`、版本分支和非法 fixture 的契约检查，再修正规范和样例。模型评测必须等前置条件检查通过之后运行；使用本地报告，不默认发布到外部服务。

每次交接追加：完成的任务 ID、修改文件、实际运行命令、结果、未解决事项和下一步。不能把本文中的待实施计划改写为已完成事实。

## 8. 实施交接日志

### 2026-09-22 / 实施开始

- 用户已授权按计划实施全部工作。不要再次询问是否开始；不自动推送或发布。
- 当前正在实施 T1：增加开发期 YAML 契约检查，统一状态与迁移协议。随后推进 T2。
- 本次开始时只有本文为未跟踪文件；没有需要覆盖的其他用户变更。
- 原始评估测试结果见第 2 节；本轮实施结果将在后续检查点追加。
- 如果本轮中断：先检查工作树和本文最新记录，运行 `npm ci`（存在锁文件时）及 `npm test`（存在 package.json 时），据失败位置继续，不要把半完成任务标为完成。

### 检查点 A / 状态协议与评测基础已落地

- 新增 package.json/lock，固定开发依赖 yaml 2.9.1；学员运行 Skill 不需要 Node。
- `npm test` 已通过：原检查 55/55、4 份状态示例及反例、29 个评测契约/夹具和 Rust 编译诊断。
- 已确认原 ownership-struggle 函数可编译；新增 ownership-observed-failure 真正触发 E0502，新增 missing-workspace。
- `evals/fixtures/catalog.mjs` 是 29 场景清单；`build.mjs` 统一创建工作区根 marker，长期场景有 366 份会话、365 份笔记和 1200 条历史证据；每次保留初始 SHA256 快照。
- 全部用例加入 Skill 工具与调用检查；只读/写入分组、registry 隔离提示、case.yaml/scaffold 已配置。真实 harness 的工作目录/脚本兼容性仍待 smoke 结果确认。
- 状态规范已写入精确版本分类、路径边界、唯一备份/中断迁移、progress 权威和事件 ID 恢复协议。模型是否真正按协议恢复尚未验证，所以 T1 可重入验收未勾选。
- T3/T4 的文档部分同时修正：7/7/21 天与 30 天退休、claims 不自动降级、日志旧到新、数量归档、400 行热预算、status 只读及 continue 交接；定量轨迹验证仍未完成。
- `scripts/run-evals.mjs` 默认只跑一个 smoke，用例逐个独立授权，强制 scaffold/no-publish，保留本地日志与版本元数据。当前正在尝试 `npm run eval -- --case total-beginner --runs 1`。
- 下一步：检查 smoke 是否成功，修复真实 harness 问题；补评测 README、报告硬门槛、跨会话与归档反例，再处理 T5/T6/T7。尚未改安装脚本，不要认为安装回滚已实现。

### 检查点 B / 安装回滚、真实 smoke 和评测纠错

- T6 已实现可恢复事务：所有 Skill 先暂存校验，再切换；失败恢复旧目录；备份放在安装目录旁，避免被重复发现。卸载移动到备份，不永久删除。
- `node tests/installers.mjs` 在 PowerShell 5.1 通过，包含中文/空格/方括号、二次切换故障注入、整体回滚、重复更新、缺源文件、链接/目录重叠拒绝及卸载。
- `wsl -d Ubuntu -- sh /mnt/d/Workspace/rust-apprentice/tests/installers-posix.sh` 通过 Linux 真实 shell 生命周期和故障注入。PowerShell 7/macOS 尚未实测。
- 真实报告揭示 93 份 grader 的 frontmatter.criteria 遮蔽了正文 PASS/FAIL；已移除并增加契约检查。所有用例必须允许 Skill 工具且证明加载。
- 首次 scaffold smoke 失败（Claude 2.1.270 Windows 路径传给 Bash 后丢失反斜杠，模型零 turn），报告在 `evals/results/2026-09-22T06-28-09.813Z/`。WSL 有 bwrap，但没有 native Node/Claude/socat；尚未安装系统依赖。
- 新手 onboarding 本来不需要工作区，runner 对 mode=none 正确使用 no-scaffold。单次真实 smoke 全部 8 个 grader 通过，报告 `evals/results/2026-09-22T06-36-46.313Z/`，实际模型由现有配置决定，为 glm-5.3-flash[1m]。不能外推到其他模型/场景。
- 已固定 skills 1.7.0 / skills-ref 0.1.5 / yaml 2.9.1；直接用 Node 执行本地 CLI，校验和发现均通过，不再出现 DEP0190。
- 新增 `tests/lib/eval-audit.mjs` 与反例测试：基础设施错误单独分类、关键 grader 不能被平均分掩盖、完整轨迹读取预算、只读 fixture 对比、证据前缀保留和写后 schema 校验。正在进行三次新手 smoke 来验证 runner 端到端审计。
- README、architecture、eval README 已同步；`docs/validation-status.md` 保存可版本化验证摘要。T5 客户端调用矩阵和 T3 多会话恢复仍未完成；原始评估与检查点 A 中已过时的“安装脚本未改”由本记录替代。

### 检查点 C / Windows harness 路径修复、斜杠调用不可观察问题与 smoke 通过

- 根因确认（基础设施）：Claude Code 2.1.270 原生 Windows 会把传给 harness 的反斜杠路径剥掉分隔符（exit 127、模型零 turn）。runner 改传正斜杠根路径与输出路径后，scaffold 场景在本机端到端可运行。这是 runner 侧绕过，不改变客户端；`scripts/run-evals.mjs` 已注释说明。
- 根因确认（评测设计）：26 个以 `/rust-learn-*` 开头的 prompt 被客户端命令展开（command-message 注入 + "Base directory for this skill"），Skill 从不经过 Skill 工具调用，`skill-loaded` grader 永远失败（0.75/0.88 假失败）。已在真实会话 jsonl 中核实该展开机制。
- 修复：全部 26 个 prompt 改写为产品文档明确支持的自然语言调用（"Let's continue my Rust apprenticeship. ..."）；`tests/eval-contracts.mjs` 新增断言禁止 prompt 以 `/rust-learn` 开头；evals/README 新增 Invocation style 一节记录机理。
- 自然语言 smoke（模型 glm-5.3-flash[1m]，单次）：total-beginner 1.00（8/8）、async-rust 1.00（8/8，Skill 真实调用 1 次）、init-impatient-learner 1.00（4/4，工作区实际写入）；status-compact-summary 0.88 为真实产品失败——模型只列出它认为相关的 2 个 domain 而非每域一行，grader 判定正确，保留为待修复项，不放水。
- T2 勾选更新：运行入口/说明、隔离注册表、prompt 无斜杠约定已完成；只读/写入分组与 29×3 全量运行、多会话轨迹（T3）、调用矩阵（T5）仍未完成。
- 全部离线检查通过：npm test 全绿（repo/state/review-policy/eval-contracts/eval-audit/installers）。
- 下一步：修复 status 每域一行失败并跑剩余用例 smoke，再推进 29×3 与 T3/T5；然后整理提交。

### 检查点 D / Pi 作为第一类 harness 的适配与真实包发现验证

- 新增 `prompts/rust-learn-{init,continue,status}.md`：Pi 命令别名，薄包装（frontmatter 只有 `description` 与 `argument-hint`，正文只有"先加载对应 skill"一句加 `$ARGUMENTS`）。`tests/repo-checks.mjs` 新增四项检查：别名清单与文件名一致、别名足够薄、别名内不得出现教学/状态词汇、仓库内不得存在技能副本（`.pi/`、`.claude/skills`）。
- README、`docs/architecture.md`、`docs/state-schema.md`、`workspace.md`、`scripts/install.sh` 注释同步为双 harness（Claude Code + Pi）：明确 `skills/` 是教学逻辑的唯一来源，`.claude-plugin/` 与 `prompts/` 只是各自 harness 的适配器，学习工作区与状态格式共用。
- 真实客户端验证（Pi 0.87.0，Windows，Node 26.1.0）：用隔离的 `PI_CODING_AGENT_DIR` 执行 `pi install <repo>` 成功写入隔离 settings；再直接调用 Pi 自己的 `DefaultResourceLoader`（0.87.0），发现恰好 3 个 skill 与 3 个同名 prompt 模板，零 diagnostic；`expandPromptTemplate("/rust-learn-status review queue")` 正确展开并把参数附在正文后。命令名、`argument-hint` 与 `/skill:<name>` 原生命令均与官方文档一致。
- 已把发现检查固化为开发期脚本 `scripts/verify-pi.mjs`（`npm run verify:pi`）：写入隔离 settings、调用 Pi 公开导出的 `DefaultResourceLoader` 断言 3 skill + 3 prompt + 零 diagnostic，缺 Pi 时 SKIP。它不进入 `npm test`（CI 无 Pi）；`pi install` 因 Windows 不能用无 shell 方式启动 `pi.cmd`，仍以手动命令记录在 `docs/validation-status.md`。
- 修正（诚实性）：三个 `SKILL.md` 的 `compatibility` 曾被写成 "Tested with Claude Code and Pi on Windows, macOS, and Linux"，这是未验证的平台声明，违反计划约束 5；改为只陈述环境要求与支持的 harness。`docs/validation-status.md` 记录本轮证据与其边界。
- 未执行、不得据本轮下结论：git 源安装（需远端仓库与网络）、Claude Code 侧调用矩阵、Pi 下的模型行为与行为评测。Pi 侧评测尚未构建。
- 观察到、待实测的打包风险：仓库根 `package.json` 是开发期工具（devDependencies + `private`）。据 Pi 文档，从 git 安装且存在 `package.json` 时会执行 `npm install`，可能顺带安装开发依赖。本地路径安装已确认不受影响；未在 git 源实测，故只记录为待办。
- 下一步不变，优先级最高：修复 status 每域一行失败；推进 T2 的 29×3、T3 多会话轨迹、T5 的 Claude Code 调用矩阵；最后走 T7 发布门槛。整理提交时把 Pi 适配作为一个独立可审查单元。
