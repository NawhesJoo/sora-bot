// 마법의 소라고동 봇
const {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const { token, clientId } = require("./config.json");

// ========================================
// 📝 여기에 소라고동의 답변을 작성하세요
// ========================================
const answers = [
  // 여기에 답변 추가
  "그래",
  "안 돼",
  "다시 물어봐",
  
  // 더 많은 답변을 추가하세요...
];

// 존댓말 체크 함수
function isPolite(text) {
  // '요?' 또는 '까?'로 끝나는지 확인
  const endsWithPolite = /[요까]\?*$/.test(text.trim());
  return endsWithPolite;
}

// 채널 이름 체크 함수
function isValidChannel(channelName) {
  return channelName.includes('소라고동') || channelName.includes('소라고둥');
}

// 명령어 정의 - 모두 같은 옵션 사용
const createConchCommand = (name, description) => {
  return new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName("질문")
        .setDescription("소라고동에게 물어볼 질문을 입력하세요")
        .setRequired(true),
    );
};

const commands = [
  createConchCommand("마법의소라고동님", "마법의 소라고동님께 여쭤보기"),
  createConchCommand("마법의소라고둥님", "마법의 소라고둥님께 여쭤보기"),
  createConchCommand("소라고동님", "소라고동님께 여쭤보기"),
  createConchCommand("소라고둥님", "소라고둥님께 여쭤보기"),
  new SlashCommandBuilder()
    .setName("도움말")
    .setDescription("마법의 소라고동 사용법"),
].map((command) => command.toJSON());

// 클라이언트 생성
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 봇 준비 완료
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Ready! Logged in as ${readyClient.user.tag}`);

  // 슬래시 커맨드 등록
  const rest = new REST().setToken(token);

  try {
    console.log("📝 슬래시 커맨드 등록 중...");

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("✅ 슬래시 커맨드 등록 완료!");
  } catch (error) {
    console.error("❌ 슬래시 커맨드 등록 실패:", error);
  }
});

// 명령어 처리
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 소라고동 명령어들 (모두 같은 처리)
  const conchCommands = ["마법의소라고동님", "마법의소라고둥님", "소라고동님", "소라고둥님"];
  
  if (conchCommands.includes(commandName)) {
    const question = interaction.options.getString("질문");
    const channelName = interaction.channel.name;

    // 1. 채널 이름 체크
    if (!isValidChannel(channelName)) {
      return await interaction.reply({
        content: "🐚 이 채널에서는 소라고동을 사용할 수 없어요!\n채널 이름에 '소라고동' 또는 '소라고둥'이 포함되어야 해요.",
        ephemeral: true // 본인에게만 보이는 메시지
      });
    }

    // 2. 존댓말 체크 ('요?' 또는 '까?'로 끝나는지)
    if (!isPolite(question)) {
      const rudeResponses = ["반말하지 마라", "존댓말로 질문해야지"];
      const rudeAnswer = rudeResponses[Math.floor(Math.random() * rudeResponses.length)];
      
      return await interaction.reply({
        content: `🐚 **마법의 소라고동**\n\n질문: *${question}*\n\n> ${rudeAnswer}`,
      });
    }

    // 3. 정상 답변
    const answer = answers[Math.floor(Math.random() * answers.length)];

    // 응답 (약간의 지연으로 생각하는 척)
    await interaction.deferReply();

    setTimeout(async () => {
      await interaction.editReply({
        content: `🐚 **마법의 소라고동**\n\n질문: *${question}*\n\n> ${answer}`,
      });
    }, 1000); // 1초 대기
  }

  // /도움말 명령어
  else if (commandName === "도움말") {
    const helpMessage =
      `🐚 **마법의 소라고동**\n\n` +
      `스폰지밥의 마법의 소라고동이 당신의 질문에 답해드립니다!\n\n` +
      `**사용 방법:**\n` +
      `\`/마법의소라고동님 질문:[질문내용]\`\n` +
      `\`/마법의소라고둥님 질문:[질문내용]\`\n` +
      `\`/소라고동님 질문:[질문내용]\`\n` +
      `\`/소라고둥님 질문:[질문내용]\`\n` +
      `\`/도움말\` - 이 도움말 보기\n\n` +
      `**중요한 규칙:**\n` +
      `⚠️ 채널 이름에 '소라고동' 또는 '소라고둥'이 포함되어야 해요\n` +
      `⚠️ 질문은 '요?' 또는 '까?'로 끝나는 존댓말이어야 해요\n\n` +
      `**예시:**\n` +
      `✅ \`/소라고동님 질문:오늘 치킨 먹어도 될까요?\`\n` +
      `✅ \`/마법의소라고동님 질문:숙제 해야 할까요???\`\n` +
      `✅ \`/소라고둥님 질문:내일 날씨 좋을까요?\`\n` +
      `❌ \`/소라고동님 질문:치킨 먹어도 돼?\` (반말)\n` +
      `❌ \`/소라고동님 질문:어떻게 할까요\` (물음표 없음)\n\n` +
      `💡 **팁:** 물음표 개수는 상관없어요! (?, ??, ??? 모두 OK)`;

    await interaction.reply(helpMessage);
  }
});

// 로그인
client.login(token);
