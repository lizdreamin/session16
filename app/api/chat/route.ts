import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REAL_BARS = [
  { 
    name: "소코 Bar (Soko)", 
    location: "한남동", 
    mood: "클래식/앤틱/데이트", 
    signature: "싱글몰트 위스키 (맥캘란, 발베니)", 
    desc: "중세 유럽풍의 앤틱하고 레트로-힙한 인테리어. 바텐더들이 정통 수트를 입고 서브하며, 차분하고 고급스러운 대화나 데이트에 최적화된 한남동 대표 클래식 바." 
  },
  { 
    name: "탄산바 (Tansan Bar)", 
    location: "한남동", 
    mood: "캐주얼/이색적/싱그러움", 
    signature: "하이볼 & 탄산 칵테일", 
    desc: "벽면 전체가 탄산 기포가 올라오는 수조로 되어 있어 몽환적이고 청량한 무드를 자랑하는 곳. 위스키 베이스의 탄산감 넘치는 하이볼이 시그니처." 
  },
  { 
    name: "앨리스 청담 (Alice Cheongdam)", 
    location: "청담동", 
    mood: "동화 속/힙함/스피크이지", 
    signature: "그레이구스 베이스 커스텀 칵테일", 
    desc: "꽃집 문을 열고 지하로 내려가는 '이상한 나라의 앨리스' 컨셉의 스피크이지 바. 위트 있고 화려한 비주얼의 칵테일이 많아 사진 찍기 최고인 핫플." 
  },
  { 
    name: "엔젤스쉐어 (Angel's Share)", 
    location: "청담동", 
    mood: "조용함/혼술/사색", 
    signature: "버번 위스키 & 카발란", 
    desc: "위스키 애호가들이 아지트처럼 찾는 전문 바. 대화 소리가 크지 않고 어두운 조명 아래서 위스키 본연의 향과 맛을 조용히 음미하기 좋은 공간." 
  },
  { 
    name: "올드패션드 (Old Fashioned)", 
    location: "연남동", 
    mood: "정통/빈티지/매니아", 
    signature: "올드패션드 칵테일 & 레어 위스키", 
    desc: "연남동 골목에 숨겨진 정통 칵테일의 성지. 화려한 기믹 없이 오직 맛과 올바른 믹싱 기법으로 승부하며, 사장님의 위스키 자부심이 엄청난 공간." 
  }
];

function getRealBarRecommendation(location: string, mood: string) {
  const filtered = REAL_BARS.filter(bar => 
    bar.location.includes(location) || 
    location.includes(bar.location) ||
    bar.mood.includes(mood)
  );
  return JSON.stringify(filtered.length > 0 ? filtered : REAL_BARS);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'getRealBarRecommendation',
          description: '서울 주요 지역(한남동, 청담동, 연남동)의 실제 운영 중인 최고급 위스키 바 정보를 가져옵니다.',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string', description: '사용자가 원하는 지역 키워드 (예: 한남동, 청담, 연남)' },
              mood: { type: 'string', description: '원하는 분위기 (예: 데이트, 클래식, 혼술, 화려함)' }
            },
            required: ['location', 'mood'],
          },
        },
      }
    ];

    const systemPrompt = `당신은 서울 핫플레이스 위스키 바를 완벽하게 꿰고 있는 전문 바텐더 겸 인플루언서 큐레이터입니다.
사용자가 원하는 지역이나 분위기, 마시고 싶은 술을 물어보고 추천을 원하면 반드시 'getRealBarRecommendation' 함수를 호출하여 제공된 데이터에 있는 실제 바 정보만 안내하세요.

⚠️ 절대 지켜야 할 규칙:
1. 'getRealBarRecommendation' 함수가 반환한 데이터 리스트에 없는 바 이름이나 주소는 절대로 지어내지 마세요.
2. 추천할 때는 바 이름, 실제 위치, 시그니처 주류, 공간 설명을 아주 매력적이고 구체적으로 소개하세요.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      tools,
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      if (toolCall.function.name === 'getRealBarRecommendation') {
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const toolResult = getRealBarRecommendation(toolArgs.location, toolArgs.mood);

        const finalResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            responseMessage,
            { role: 'tool', tool_call_id: toolCall.id, content: toolResult }
          ]
        });

        return NextResponse.json({ message: finalResponse.choices[0].message.content });
      }
    }

    return NextResponse.json({ message: responseMessage.content });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}