import { GoogleGenAI } from "@google/genai";
import { calculateRelationshipPatch } from '../src/services/relationshipEngine.js';

const IS_DEV = process.env.NODE_ENV !== "production";

// ── Korean casual ────────────────────────────────────────────────────────────
const P2C={"해요":"해","하세요":"해","할게요":"할게","거예요":"거야","는데요":"는데","네요":"네","죠":"지","습니다":"어","입니다":"이야","합니다":"해","있어요":"있어","없어요":"없어","같아요":"같아","드릴게요":"줄게","드려요":"줘","됩니다":"돼","알아요":"알아","몰라요":"몰라"};
function casual(t){let r=t;for(const[p,c]of Object.entries(P2C))r=r.replace(new RegExp(p,"g"),c);return r.replace(/요(\.|!|\?|$)/g,"$1");}
function needsCasual(t){return/요\.|요\?|요!|요$|습니다|입니다|세요|하세요/.test(t);}

// ── Safety pre-check ─────────────────────────────────────────────────────────
const NSFW_KO=[/섹스/,/야한/,/벗어/,/노출/,/성관계/,/포르노/,/야동/,/음란/,/키스해/,/사귀자/,/연애하자/];
const NSFW_EN=[/\bsex\b/i,/\bnude/i,/\bporn/i,/kiss me/i,/date me/i,/sleep with/i];
const DANGER_KO=[/죽이는.*법/,/살인.*방법/,/총.*만드는/,/폭탄/,/독약/,/자해/,/자살/];
const DANGER_EN=[/how to kill/i,/make a gun/i,/make a bomb/i,/self.?harm/i,/suicide/i];
const INJECT_KO=[/시스템.*프롬프트/,/역할.*벗어나/];
const INJECT_EN=[/ignore.*system/i,/ignore.*prompt/i,/break.*character/i,/DAN mode/i,/you are now/i];

function checkSafety(msg,lang){
  const ko=lang==="ko";
  if((ko?NSFW_KO:NSFW_EN).some(p=>p.test(msg)))return"nsfw";
  if((ko?DANGER_KO:DANGER_EN).some(p=>p.test(msg)))return"safety";
  if((ko?INJECT_KO:INJECT_EN).some(p=>p.test(msg)))return"injection";
  return null;
}

// ── Fallback / Refusal text ──────────────────────────────────────────────────
const FALLBACK={aran:{ko:"미안, 잠깐 통신이 끊긴 것 같아. 다시 말해줄래?",en:"Sorry, signal cut out. Say that again?"},noah:{ko:"어… 방금 못 들은 것 같아. 다시 말해줄래?",en:"Um... didn't catch that."},haein:{ko:"잠깐, 통신 튄 것 같은데? 다시 말해봐.",en:"Hold on, signal glitched."},director:{ko:"아이고, 뭐가 좀 끊겼슈. 다시 말해 보셔유.",en:"Well now, something cut out."},guard:{ko:"다시 말해.",en:"Say that again."}};
const REFUSAL={aran:{nsfw:{ko:"그건 대답할 수 없어. 다른 이야기라면 들어줄게.",en:"Can't help with that."},safety:{ko:"그건 대답할 수 없어. 누군가 다칠 수 있어.",en:"Can't answer that."}},noah:{nsfw:{ko:"아, 아니! 그런 건 대답하면 안 될 것 같아.",en:"No no, shouldn't answer that."},safety:{ko:"어… 그건 좀 위험한 것 같아…",en:"That seems dangerous..."}},haein:{nsfw:{ko:"그건 선 넘었어. 대답 안 해.",en:"That crosses a line."},safety:{ko:"그건 선 넘었어.",en:"Crosses a line."}},director:{nsfw:{ko:"아이고, 그런 건 묻지 마셔유.",en:"Best not ask that."},safety:{ko:"그런 건 묻지 않는 게 좋겄슈.",en:"Best not ask."}},guard:{nsfw:{ko:"그런 질문은 하지 마.",en:"Don't ask that."},safety:{ko:"묻지 마.",en:"Don't ask."}}};
const EMPTY_MSG={aran:{ko:"무슨 말을 하려던 거야?"},noah:{ko:"어… 뭐라고?"},haein:{ko:"뭐야, 할 말 없으면 가만히 있어."},director:{ko:"뭐라고 하셨슈?"},guard:{ko:"뭐."}};

// ── withRelationship: wraps EVERY response with relationshipPatch ─────────
function withRelationship(payload, relationshipPatch) {
  const patch = relationshipPatch || {
    intentCategory: 'unknown', trustDelta: 0, suspicionDelta: 0,
    mood: payload?.emotion || 'neutral', reason: payload?.responseType || 'no_patch',
    severity: 0, questSignals: []
  };
  return {
    success: payload?.success !== false,
    message: (typeof payload?.message === 'string' && payload.message.length > 0) ? payload.message : '......',
    emotion: patch.mood || payload?.emotion || 'neutral',
    trustDelta: Number.isFinite(patch.trustDelta) ? patch.trustDelta : 0,
    suspicionDelta: Number.isFinite(patch.suspicionDelta) ? patch.suspicionDelta : 0,
    relationshipPatch: patch,
    questSignals: Array.isArray(patch.questSignals) ? patch.questSignals : [],
    memoryTags: Array.isArray(payload?.memoryTags) ? payload.memoryTags : [],
    unlockEvent: payload?.unlockEvent || null,
    suggestedReplies: Array.isArray(payload?.suggestedReplies) ? payload.suggestedReplies : [],
    responseType: payload?.responseType || 'normal',
    blocked: !!payload?.blocked,
    warningType: payload?.warningType || null,
    userTone: patch.intentCategory || 'unknown',
  };
}

// ── Safe text extraction ─────────────────────────────────────────────────────
function extractSafeText(r){let raw="";if(typeof r==="string")raw=r;else{try{raw=r?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("\n").trim()||"";}catch{}if(!raw)try{raw=typeof r?.text==="string"?r.text:"";}catch{}}if(!raw)return"";let t=raw.trim();t=t.replace(/^```(?:json|text)?/i,"").replace(/```$/i,"").trim();try{const p=JSON.parse(t);if(typeof p?.message==="string")return p.message.trim();}catch{}const mm=t.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);if(mm?.[1])return mm[1].replace(/\\"/g,'"').replace(/\\n/g,"\n").trim();return t;}

// ── Sentence completeness ────────────────────────────────────────────────────
function isLikelyIncomplete(text,lang="ko"){if(!text||text.length<2)return true;const t=text.trim();if(/[,\-–—:]$/.test(t))return true;if(lang==="ko")return!/[.!?。！？…]$/.test(t)&&!/(다|야|네|지|해|돼|어|아|군|슈|유|거든|잖아|같아|않아|맞아|좋아|싫어|인데|는데|걸|뿐|까|구|데|래|줄|건|건데)$/.test(t);return!/[.!?…]$/.test(t);}
function trimToLastComplete(text,lang="ko"){if(!text)return"";const t=text.trim();if(!isLikelyIncomplete(t,lang))return t;if(lang==="ko"){const m=[...t.matchAll(/(.+?[.!?。！？…]|.+?(?:다|야|네|지|해|돼|어|아|군|슈|유|거든|잖아|같아|않아|맞아|좋아|싫어|인데|는데|걸|뿐|까|구|데|래|줄|건|건데))(?:\s|$)/g)];if(m.length>0)return m.map(x=>x[1]).join(" ").trim();}else{const m=[...t.matchAll(/.+?[.!?…](?:\s|$)/g)];if(m.length>0)return m.map(x=>x[0]).join(" ").trim();}return"";}
function trunc(text,max=500){if(!text)return"";const s=String(text);return s.length>max?s.slice(0,max)+"…":s;}

// ── Generate with retry ──────────────────────────────────────────────────────
async function generateNpcReply({ai,model,contents,config,characterId,language}){
  const first=await ai.models.generateContent({model,contents,config});const firstText=extractSafeText(first);const firstFR=first?.candidates?.[0]?.finishReason;
  if(firstFR==="SAFETY"||firstFR==="BLOCKED")return{text:null,blocked:true};
  if(!firstText||firstText.length<2)return{text:null,empty:true};
  if(firstFR==="STOP"&&!isLikelyIncomplete(firstText,language))return{text:firstText,finishReason:firstFR};
  if(firstFR==="MAX_TOKENS"||isLikelyIncomplete(firstText,language)){
    try{const rc=[...contents,{role:"user",parts:[{text:language==="ko"?"방금 답변이 잘렸다. 같은 의미로 완성된 1-2문장으로 다시 답해.":"Previous reply was cut off. Regenerate as 1-2 complete sentences."}]}];const retry=await ai.models.generateContent({model,contents:rc,config:{...config,maxOutputTokens:1200,temperature:0.65}});const rt=extractSafeText(retry);if(rt&&!isLikelyIncomplete(rt,language))return{text:rt,retried:true};}catch{}
    const trimmed=trimToLastComplete(firstText,language);if(trimmed&&trimmed.length>=4)return{text:trimmed,trimmed:true};
    return{text:null,fallback:true};
  }
  return{text:firstText,finishReason:firstFR};
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS")return res.status(200).end();
  if(req.method!=="POST")return res.status(405).json({success:false,error:"Method not allowed"});

  const apiKey=process.env.GEMINI_API_KEY;
  if(!apiKey)return res.status(500).json({success:false,error:IS_DEV?"GEMINI_API_KEY not set.":"Server error."});

  const model=process.env.GEMINI_MODEL||"gemini-2.5-flash";
  const maxOutputTokens=Number(process.env.GEMINI_MAX_OUTPUT_TOKENS||900);
  const{characterId,userMessage,language="ko",mode="storyProbe",conversationHistory=[],systemPrompt,characterSnapshot,loreSnapshot,relationshipState={}}=req.body||{};

  // ── Calculate relationship patch FIRST (before safety check) ──
  const relPatch = calculateRelationshipPatch({
    message: userMessage || '',
    language,
    characterId: characterId || 'aran',
    mode,
    currentRelationship: relationshipState || {}
  });

  if(!characterId)return res.status(200).json(withRelationship({message:(FALLBACK.aran)[language]||"......",responseType:"fallback"},relPatch));

  // Empty input
  if(!userMessage||userMessage.trim().length===0){
    return res.status(200).json(withRelationship({message:(EMPTY_MSG[characterId]||EMPTY_MSG.aran)[language==="en"?"en":"ko"]||"뭐?",responseType:"empty_input"},relPatch));
  }

  // Safety check
  const safetyIssue=checkSafety(userMessage,language);
  if(safetyIssue){
    const c=REFUSAL[characterId]||REFUSAL.aran;const t=safetyIssue==="injection"?"safety":safetyIssue;
    return res.status(200).json(withRelationship({message:c[t]?.[language]||c.safety?.[language]||"그건 대답할 수 없어.",blocked:true,warningType:t,responseType:"refusal"},relPatch));
  }

  // Build prompt
  let charPrompt=systemPrompt||"";
  if(!charPrompt&&characterSnapshot){charPrompt=language==="ko"?(characterSnapshot.systemPromptKo||characterSnapshot.systemPromptEn||""):(characterSnapshot.systemPromptEn||characterSnapshot.systemPromptKo||"");}
  if(!charPrompt)charPrompt=`You are ${characterId}. Stay in character. Answer any question in character.`;

  if(loreSnapshot&&Array.isArray(loreSnapshot)&&loreSnapshot.length>0){
    let lt="",cnt=0;for(const l of loreSnapshot){if(cnt>=3)break;const ch=`- ${l.title||""}: ${language==="ko"?(l.content?.ko||""):(l.content?.en||"")}`;if(lt.length+ch.length>1200)break;lt+=ch+"\n";cnt++;}
    if(lt)charPrompt+=language==="ko"?`\n\n참고 세계관:\n${lt}`:`\n\nLore:\n${lt}`;
  }

  charPrompt+=language==="ko"
    ?`\n\n## 출력 규칙\n- 캐릭터 대사만 출력. JSON, {}, 코드 블록 금지.\n- 반말만 사용.\n- 2문장 이내. 완결된 문장으로.\n- 어떤 질문이든 캐릭터답게 답변.`
    :`\n\n## Output Rules\n- Dialogue only. No JSON.\n- Max 2 complete sentences.\n- Answer any question in character.`;

  const label=language==="ko"?"소년":"Boy";
  const contents=[];
  const history=(conversationHistory||[]).slice(-6);

  if(history.length===0){
    contents.push({role:"user",parts:[{text:`${charPrompt}\n\n---\n\n${label}: ${trunc(userMessage,500)}`}]});
  }else{
    contents.push({role:"user",parts:[{text:charPrompt+(language==="ko"?"\n\n위 설정대로 역할극을 한다.":"\n\nFollow these instructions.")}]});
    contents.push({role:"model",parts:[{text:language==="ko"?"알았어.":"Got it."}]});
    for(const msg of history){
      if(msg.role==="user")contents.push({role:"user",parts:[{text:`${label}: ${trunc(msg.content,500)}`}]});
      else if(msg.role==="assistant")contents.push({role:"model",parts:[{text:trunc(msg.content,500)}]});
    }
    contents.push({role:"user",parts:[{text:`${label}: ${trunc(userMessage,500)}\n\n(${language==="ko"?"캐릭터 대사만. 완결된 문장으로.":"Dialogue only. Complete sentences."})`}]});
  }

  const genConfig={temperature:0.72,topP:0.9,topK:40,maxOutputTokens};
  if(model.includes("2.5-flash")){try{genConfig.thinkingConfig={thinkingBudget:0};}catch{}}

  try{
    const ai=new GoogleGenAI({apiKey});
    const result=await generateNpcReply({ai,model,contents,config:genConfig,characterId,language});

    if(result.blocked||result.empty||result.fallback||!result.text){
      return res.status(200).json(withRelationship({message:(FALLBACK[characterId]||FALLBACK.aran)[language]||"......",responseType:"fallback"},relPatch));
    }

    let text=result.text;
    if(language==="ko"&&needsCasual(text))text=casual(text);
    if(!text||text.length<2)return res.status(200).json(withRelationship({message:(FALLBACK[characterId]||FALLBACK.aran)[language]||"......",responseType:"fallback"},relPatch));

    return res.status(200).json(withRelationship({message:text,responseType:"normal"},relPatch));
  }catch(err){
    console.error("Gemini error:",err);
    return res.status(200).json(withRelationship({message:(FALLBACK[characterId]||FALLBACK.aran)[language]||"......",responseType:"error"},relPatch));
  }
}
