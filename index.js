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

// 답변 목록
const answers = [
  // 긍정 답변
  "그래",
  "해",
  "그러렴",
  "그렇게 해",

  // 부정 답변
  "아니",
  "안 돼",
  "절.대.안.돼",
  "가만히 있어",

  // 애매한 답변
  "흠...",
  "마음대로 해" ,
  "...아무것도 하지 마..."
  
];

// 존댓말 체크 함수
function isPolite(text) {
  // '요?' 또는 '까?'로 끝나는지 확인
  const endsWithPolite = /[요까]\?*$/.test(text.trim());
  return endsWithPolite;
}

/* 채널 제한 기능 제거
// 채널 이름 체크 함수
function isValidChannel(channelName) {
  //return channelName.includes('소라고동') || channelName.includes('소라고둥');
  return channelName.includes('소라고동');
}
*/

// 명령어 정의 - 모두 같은 옵션 사용
const createConchCommand = (name, description) => {
  return new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName("질문")
        .setDescription("마법의 소라고동에게 물어볼 질문을 입력하세요")
        .setRequired(true),
    );
};

const commands = [
  createConchCommand("마법의소라고동님", "마법의 소라고동님께 여쭤보기"),
  //createConchCommand("마법의소라고둥님", "마법의 소라고둥님께 여쭤보기"),
  createConchCommand("소라고동님", "마법의 소라고동님께 여쭤보기"),
  //createConchCommand("소라고둥님", "소라고둥님께 여쭤보기"),
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
  console.log(`✅✅✅ Ready! Logged in as ${readyClient.user.tag}`);
  console.log(`봇 ID: ${readyClient.user.id}`);
  console.log(`서버 수: ${readyClient.guilds.cache.size}`);

  // 슬래시 커맨드 등록
  const rest = new REST().setToken(token);

  try {
    console.log("🗑️ 기존 슬래시 커맨드 삭제 중...");

    // 기존 명령어 전부 삭제
    await rest.put(Routes.applicationCommands(clientId), { body: [] });

    console.log("✅ 기존 명령어 삭제 완료!");
    console.log("📝 새로운 슬래시 커맨드 등록 중...");

    // 글로벌 커맨드 등록 (모든 서버에 적용)
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("✅ 슬래시 커맨드 등록 완료!");
    console.log(`📊 등록된 명령어 수: ${commands.length}개`);
    commands.forEach((cmd) => {
      console.log(`   - /${cmd.name}`);
    });
  } catch (error) {
    console.error("❌ 슬래시 커맨드 등록 실패:", error);
  }
});

// 명령어 처리
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 소라고동 명령어들 (모두 같은 처리)
  //const conchCommands = ["마법의소라고동님", "마법의소라고둥님", "소라고동님", "소라고둥님"];
  const conchCommands = ["마법의소라고동님", "소라고동님"];
  
  if (conchCommands.includes(commandName)) {
    const question = interaction.options.getString("질문");
    const channelName = interaction.channel.name;
    const userName = interaction.user.tag; // 사용자 이름#태그
    const userId = interaction.user.id; // 사용자 ID
    const guildName = interaction.guild?.name || "DM"; // 서버 이름

    console.log("\n" + "=".repeat(50));
    console.log(`🐚 소라고동 호출!`);
    console.log(`📍 서버: ${guildName}`);
    console.log(`📍 채널: #${channelName}`);
    console.log(`👤 사용자: ${userName} (${userId})`);
    console.log(`❓질문: "${question}"`);

    /* 채널 제한 기능 제거
    // 1. 채널 이름 체크
    if (!isValidChannel(channelName)) {
      return await interaction.reply({
        //content: "🐚 이 채널에서는 소라고동을 사용할 수 없어요!\n채널 이름에 '소라고동' 또는 '소라고둥'이 포함되어야 해요.",
        content: "🐚 이 채널에서는 소라고동을 사용할 수 없어요!\n채널 이름에 '소라고동'이 포함되어야 해요.",
        ephemeral: true // 본인에게만 보이는 메시지
      });
    }
    */

    // 2. 존댓말 체크 ('요?' 또는 '까?'로 끝나는지)
    if (!isPolite(question)) {
      const rudeResponses = ["(무시)", "존댓말로 다시해.", "다시"];
      const rudeAnswer = rudeResponses[Math.floor(Math.random() * rudeResponses.length)];
      
      return await interaction.reply({
        //content: `🐚 **마법의 소라고동**\n\n질문: *${question}*\n\n> ${rudeAnswer}`,
        content: `🐚 **마법의 소라고동**\n\n질문: *${question}*\n\n\`\`\`\n${rudeAnswer}\n\`\`\``,
      });
    }

    // 3. 정상 답변
    const answer = answers[Math.floor(Math.random() * answers.length)];

    // 응답 (약간의 지연으로 생각하는 척)
    await interaction.deferReply();

    setTimeout(async () => {
      await interaction.editReply({
        //content: `🐚 **마법의 소라고동**\n\n질문: *${question}*\n\n> ${answer}`,
        content: `🐚 **마법의 소라고동**\n\n질문: *${question}*\n\n\`\`\`\n${answer}\n\`\`\``,
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
      //`\`/마법의소라고둥님 질문:[질문내용]\`\n` +
      `\`/소라고동님 질문:[질문내용]\`\n` +
      //`\`/소라고둥님 질문:[질문내용]\`\n` +
      `\`/도움말\` - 이 도움말 보기\n\n` +
      `**중요한 규칙:**\n` +
      //`⚠️ 채널 이름에 '소라고동' 또는 '소라고둥'이 포함되어야 해요\n` +
      `⚠️ 채널 이름에 '소라고동'이 포함되어야 해요\n` +
      `⚠️ 질문은 '요?' 또는 '까?'로 끝나는 존댓말이어야 해요\n\n` +
      `**예시:**\n` +
      `✅ \`/소라고동님 질문:오늘 치킨 먹어도 될까요?\`\n` +
      `✅ \`/마법의소라고동님 질문:숙제 해야 할까요???\`\n` +
      //`✅ \`/소라고둥님 질문:내일 날씨 좋을까요?\`\n` +
      `❌ \`/소라고동님 질문:치킨 먹어도 돼?\` (반말)\n` +
      `❌ \`/소라고동님 질문:어떻게 할까요\` (물음표 없음)\n\n` +
      `💡 **팁:** 물음표 개수는 상관없어요! (?, ??, ??? 모두 OK)`;

    await interaction.reply(helpMessage);
  }
});

// 로그인
client.login(token);
