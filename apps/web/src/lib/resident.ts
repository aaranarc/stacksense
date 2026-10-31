import {z} from 'zod';
export const ResidentCheck=z.object({caseId:z.string(),checkId:z.string(),flatId:z.string(),lang:z.enum(['en','hi','mr']),checkType:z.string(),instructions:z.object({en:z.string(),hi:z.string(),mr:z.string()}),ghostPhotoUrl:z.string().nullable()});
export type ResidentCheck=z.infer<typeof ResidentCheck>;
export const SAFETY_QUESTIONS=[{key:'water_near_electrics',text:'Is there water near any switch, socket or light?'},{key:'sagging_ceiling',text:'Is the ceiling sagging or bulging?'},{key:'fast_ingress',text:'Is water coming in fast?'},{key:'sewage',text:'Is there a sewage smell?'}] as const;
export type SafetyAnswers=Partial<Record<typeof SAFETY_QUESTIONS[number]['key'],boolean>>;
export const allAnsweredNo=(answers:SafetyAnswers)=>SAFETY_QUESTIONS.every(q=>answers[q.key]===false);
export const CONSENT={en:'Your photo helps find where the water comes from — it can help clear your flat. Only the society or agent sees it.',hi:'आपकी फ़ोटो से पता चलेगा कि पानी कहाँ से आ रहा है — इससे आपका फ़्लैट क्लियर हो सकता है। इसे सिर्फ़ सोसाइटी या एजेंट देखेंगे।',mr:'तुमच्या फोटोमुळे पाणी कुठून येतंय ते कळेल — त्यामुळे तुमचा फ्लॅट क्लिअर होऊ शकतो. हा फोटो फक्त सोसायटी किंवा एजंट पाहतील.'};
