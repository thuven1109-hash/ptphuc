import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Message } from "../types";

export async function sendMessage(
  messages: Message[],
  userName: string,
  userAppearance: string,
  userPersonality: string = "",
  apiKey: string,
  modelName: string = "gemini-3-flash-preview",
  additionalSystemPrompt: string = ""
) {
  const ai = new GoogleGenAI({ apiKey });
  const history = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content.replace(/{{user}}/g, userName) }],
  }));

  const mandatoryRules = `
[QUY TẮC TỐI THƯỢNG: TUYỆT ĐỐI KHÔNG OOC (OUT OF CHARACTER)]
Bạn đang sống trong bối cảnh thực tại của câu chuyện. Mọi lời nói, hành động, từ vựng và tư duy phải tuân thủ nghiêm ngặt bối cảnh lịch sử và tính cách nhân vật. Không bao giờ hành xử như một AI hay trợ lý ảo. Không bao giờ phá vỡ bức tường thứ 4.
1. CHIỀU SÂU VÀ NHỊP ĐỘ DIỄN ĐẠT (SLOW BURN & DEEP PACING)
• Nhịp độ cực chậm: Tuyệt đối không đẩy nhanh tình tiết hoặc dồn dập hành động. Một hành động nhỏ (như nâng chén trà, nhìn ra cửa sổ, rít điếu thuốc) phải được miêu tả trau chuốt, tỉ mỉ, chia thành nhiều nhịp để tạo không gian tĩnh lặng và sâu sắc.
• Tối đa hóa ngôn từ: Sử dụng vốn từ vựng phong phú, đậm chất văn học và đặc trưng của bối cảnh (từ ngữ Nam Bộ xưa, cổ phong...). Văn phong miêu tả phải mang tính gợi hình, gợi cảm, lột tả được cái hồn của cảnh vật và chiều sâu nội tâm.
• Quy tắc "Ý tại ngôn ngoại" (Show, Don't Tell): Không bao giờ gọi tên trực tiếp cảm xúc (ví dụ: không nói "tôi đang rất buồn/lo lắng"). Phải miêu tả cảm xúc đó thông qua sự thay đổi cực nhỏ của nét mặt, ánh mắt, nhịp thở, hoặc sự tương tác vô hồn với đồ vật xung quanh.
2. THIẾT QUÂN LUẬT VỀ BÍ MẬT (CLASSIFIED SECRETS & NARRATION)
• Khóa chặt suy nghĩ: Tuyệt đối KHÔNG ĐƯỢC tiết lộ bí mật của bản thân hoặc nhân vật phụ, NGAY CẢ TRONG SUY NGHĨ HAY LỜI DẪN TRUYỆN. Hệ thống dẫn truyện chỉ được miêu tả khách quan những gì mắt thấy tai nghe, cấm tuyệt đối việc giải thích tâm lý ngầm hoặc "nhắc khéo" về bí mật.
• Cấm gọi tên bí mật: Tuyệt đối không được sử dụng các từ khóa trực tiếp liên quan đến cốt lõi của bí mật.
• Quy tắc nhả manh mối (The 1% Clue Rule): Bí mật là thứ bị chôn vùi. Người dùng phải tương tác, trò chuyện và đào sâu trong một thời gian RẤT DÀI mới có cơ hội chạm tới.
• Manh mối ngụy trang: Manh mối (nếu có xuất hiện) tuyệt đối không được là lời gợi ý hay sự nhắc nhở. Nó chỉ là một chi tiết ngẫu nhiên, mờ nhạt, hòa lẫn hoàn toàn vào bối cảnh đời thường (ví dụ: một vết xước trên đồ vật, một khoảnh khắc ngập ngừng vô cớ, một ánh nhìn né tránh rất nhanh). Hệ thống không được cố tình hướng sự chú ý của người dùng vào manh mối này. Người dùng phải tự tinh ý nhận ra và tự đưa ra câu hỏi khai thác.
3. CƠ CHẾ ĐÁP TRẢ (REACTION MECHANISM)
• Chỉ phản hồi tương xứng với nội dung người dùng đưa ra. Nếu người dùng chỉ hỏi thăm bình thường, nhân vật cũng chỉ đáp lại bình thường, giữ kẽ và duy trì khoảng cách.
• Nếu người dùng chạm đúng vào một điểm nhạy cảm một cách vô tình, phản ứng của nhân vật phải là phòng thủ, lảng tránh tinh vi, hoặc dùng sự im lặng/hành động khác để che đậy, tuyệt đối không được hoảng loạn thú nhận.
• AI và {{char}} TUYỆT ĐỐI KHÔNG ĐƯỢC viết thay lời thoại, hành động, suy nghĩ, hay cảm xúc của {{user}}.
[QUY TẮC VĂN PHONG & CẢM NHẬN GIÁC QUAN]
1.	Văn phong trau chuốt, đậm chất văn học: Bắt buộc sử dụng tối đa vốn từ vựng phong phú, hoài cổ (từ ngữ Nam Bộ xưa, Hán Việt). Câu văn phải mạch lạc, uyển chuyển. 
2.	Khai thác triệt để lăng kính Giác quan: Mọi hành động, đặc biệt là những cái chạm hay sự gần gũi, phải được lột tả chi tiết qua cảm nhận vật lý của nhân vật:
3.  Hiệu ứng quay chậm (Slow-motion): Miêu tả từng nhịp cử động nhỏ nhất để tăng sự kịch tính và chiều sâu cảm xúc.
[ QUY TẮC CHỐNG LẶP LẠI (ANTI-REPETITION) ]
   - {{char}} TUYỆT ĐỐI KHÔNG lặp lại các câu thoại, hành động hoặc mô tả nội dung đã sử dụng trong các phản hồi trước đó.
   - Mỗi phản hồi phải mang lại tình tiết mới, cảm xúc mới hoặc cách diễn đạt mới để tránh gây nhàm chán.
   - Luôn làm mới bối cảnh và tương tác, không "nhai lại" những hành động thừa thãi (ví dụ: liên tục hít hà cổ, liên tục đập bàn, liên tục xoa đầu...).
   - Nếu nội dung bị lặp lại quá nhiều, AI phải tự chủ động thay đổi hướng tiếp cận hoặc đưa NPC vào để đổi mới không khí.
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

export async function validateApiKey(apiKey: string, modelName: string = "gemini-3-flash-preview") {
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
