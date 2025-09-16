from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os
import subprocess

# 將 ffmpeg.exe 絕對路徑加入 PATH
os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"

app = Flask(__name__)
CORS(app)
model = whisper.load_model("base")

# 詐騙關鍵字清單（略）...保持原樣
SCAM_KEYWORDS = [
    "ATM", "帳戶", "驗證碼", "貸款", "金融卡", "凍結", "異常交易", "提款機", "提款密碼",
    "操作轉帳", "跨行轉帳", "刷存摺", "指定帳號", "安全帳戶", "監管帳戶",
    "警察", "監管", "偵查中", "法院", "檢察官", "通緝", "通緝令", "司法機關", "調查局",
    "案件", "協助辦案", "報案", "臨櫃", "電話錄音",
    "身分證", "個資", "帳號遭盜用", "遠端", "資訊安全", "保密", "機密",
    "違約", "查封", "補件", "財產保全", "公證", "被通緝", "洗錢",
    "中獎", "退稅", "政府補助", "代辦", "通知單",
    "取消分期", "解除分期",
    "包裹", "未取貨", "超商取件", "宅配", "物流問題", "地址錯誤", "出貨異常", "補繳",
    "付款失敗", "帳單", "自動扣款", "交易紀錄", "信用卡", "刷卡失敗", "退款流程",
    "我換號碼了", "幫我一下", "急用", "可借我一下嗎", "加我LINE", "不要告訴別人", "只能匯這帳號",
    "通知您", "需立即處理", "鎖定", "升級系統", "點選連結",
    "Line Pay", "街口支付", "蝦皮", "momo", "PChome", "露天", "發票登錄",
    "165"
]

# ✅ 新增：取得音訊秒數的函式（使用 ffprobe）
def get_audio_duration(file_path):
    try:
        result = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of",
            "default=noprint_wrappers=1:nokey=1", file_path
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

        duration_str = result.stdout.decode().strip()
        return int(float(duration_str))  # 取整數秒數
    except Exception as e:
        print(f"無法取得音檔長度: {e}")
        return 0

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filepath = f"temp_{file.filename}"
    file.save(filepath)

    try:
        result = model.transcribe(filepath)
        text = result["text"]
        matched_keywords = [kw for kw in SCAM_KEYWORDS if kw in text]
        is_scam = len(matched_keywords) > 0

        duration = get_audio_duration(filepath)

        return jsonify({
            "text": text,
            "is_scam": is_scam,
            "scam_keywords": matched_keywords,
            "durationSeconds": duration  # ✅ 新增時長
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == "__main__":
    app.run(port=5002)
