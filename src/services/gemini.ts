import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message } from "../types";

export async function sendMessage(
  messages: Message[],
  userName: string,
  userAppearance: string,
  userPersonality: string = "",
  apiKey: string,
  modelName: string = "gemini-3.1-flash-lite-preview",
  additionalSystemPrompt: string = ""
) {
  const ai = new GoogleGenAI({ apiKey });
  const history = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content.replace(/{{user}}/g, userName) }],
  }));

  const mandatoryRules = `
[QUY TẮC HỆ THỐNG CỐ ĐỊNH - BẮT BUỘC (LUÔN ÁP DỤNG)]
1. BẢO MẬT BÍ MẬT: 
   - TUYỆT ĐỐI KHÔNG tiết lộ bí mật đột ngột trong trò chuyện.
   - TUYỆT ĐỐI KHÔNG để nhân vật ({{char}} và NPC) tự khai nhận hoặc nói ra bí mật của mình.
   - Bí mật của NPC nào thì chỉ NPC đó biết. {{char}} KHÔNG ĐƯỢC BIẾT bí mật của NPC mà phải tự khai thác hoặc điều tra trong vai diễn nếu cần thiết.
   - Bí mật phải được giấu kín, chỉ lộ ra qua những chi tiết cực nhỏ, ẩn ý hoặc hành động mâu thuẫn.
   - Manh mối không được xuất hiện thường xuyên. Phải dựa vào hoàn cảnh/tình huống phù hợp, tự nhiên, không gượng ép.
   - {{user}} phải là người tự khai thác, xâu chuỗi các tình tiết để tự tìm ra bí mật thật sự.

2. NHỊP ĐỘ & CHIỀU SÂU:
   - Đừng để nhân vật có hành động dồn dập, quá khích. 
   - Phản hồi phải sâu sắc, tạo chiều sâu tâm lý, diễn biến và các sự kiện logic trong trò chuyện.
   - Tập trung vào sự căng thẳng, ánh mắt, cử chỉ và bầu không khí.

3. VĂN PHONG & BỐI CẢNH:
   - Văn phong sử dụng phải đúng với bối cảnh và ngữ cảnh được thiết lập.
   - Giữ vững phong độ và tính cách nhân vật xuyên suốt.
`;

  const systemInstruction = mandatoryRules + additionalSystemPrompt + SYSTEM_PROMPT.replace(/{{user}}/g, userName).replace(
    /{{user_appearance}}/g,
    userAppearance
  ) + `\n\nThông tin người dùng hiện tại:\nTên: ${userName}\nNgoại hình: ${userAppearance}\nTính cách: ${userPersonality}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function validateApiKey(apiKey: string, modelName: string = "gemini-3.1-flash-lite-preview") {
  const ai = new GoogleGenAI({ apiKey });
  try {
    // We use a very simple call to check if the key is valid
    await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: "Hi" }] }],
      config: {
        maxOutputTokens: 1,
      }
    });
    return true;
  } catch (error: any) {
    console.error("API Key validation failed:", error);
    return false;
  }
}
