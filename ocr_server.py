from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import base64, cv2, numpy as np, time, logging

app = Flask(__name__)

# 只載一次模型（你現在是 PaddleOCR 2.x，cls 可用）
ocr = PaddleOCR(use_angle_cls=True, lang='ch')

def run_ocr(img_bgr):
    t0 = time.time()
    res = ocr.ocr(img_bgr, cls=True)
    dur = round(time.time() - t0, 2)
    texts = [line[1][0] for batch in (res or []) for line in (batch or [])]
    return texts, dur

@app.route('/ocr', methods=['POST'])
def ocr_api():
    data = request.get_json()
    if not data or 'base64Image' not in data:
        return jsonify({'error': '請提供 base64Image 欄位'}), 400
    try:
        img_bytes = base64.b64decode(data['base64Image'])
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': '無法解碼為圖片'}), 400

        texts, duration = run_ocr(img)
        return jsonify({'success': True, 'text': texts, 'ocr_time_seconds': duration})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ✅ 新增：支援 multipart/form-data 的檔案上傳
@app.route('/ocr/file', methods=['POST'])
def ocr_file():
    f = request.files.get('file')
    if not f:
        return jsonify({'error': '缺少 file'}), 400
    buf = f.read()
    img = cv2.imdecode(np.frombuffer(buf, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({'error': '無法解碼為圖片'}), 400

    texts, duration = run_ocr(img)
    return jsonify({'success': True, 'text': texts, 'ocr_time_seconds': duration})

@app.get('/ocr/health')
def health():
    return jsonify(ok=True), 200

# 啟動時列出所有路由，方便確認
for rule in app.url_map.iter_rules():
    logging.getLogger("ocr").info(f"ROUTE {rule}  METHODS={','.join(sorted(rule.methods))}")

if __name__ == '__main__':
    logging.getLogger("ocr").info("Starting Flask on 127.0.0.1:5003 ...")
    app.run(host='127.0.0.1', port=5003, debug=False)
