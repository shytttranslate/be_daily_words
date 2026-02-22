"""
Word difficulty API: CEFR level (cefrpy) + SUBTLEX frequency.
Run in Docker; NestJS calls this service.
"""
import os
from flask import Flask, jsonify, request

from subtlex_loader import get_frequency

app = Flask(__name__)

# Mô tả cấp độ CEFR (dạng chữ)
CEFR_LEVEL_MEANINGS = {
    "A1": "Beginner",
    "A2": "Elementary",
    "B1": "Intermediate",
    "B2": "Upper Intermediate",
    "C1": "Advanced",
    "C2": "Proficient",
}

# Lazy init cefrpy (loads data on first use)
_analyzer = None


def get_analyzer():
    global _analyzer
    if _analyzer is None:
        from cefrpy import CEFRAnalyzer
        _analyzer = CEFRAnalyzer()
    return _analyzer


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "word-difficulty"})


@app.route("/word/<word>", methods=["GET"])
def word_difficulty(word: str):
    """Return CEFR difficulty and SUBTLEX frequency for a word."""
    if not word or not word.strip():
        return jsonify({"error": "word is required"}), 400

    word = word.strip()
    result = {
        "word": word,
        "cefr_level": None,
        "cefr_level_meaning": None,
        "cefr_level_float": None,
        "frequency": None,
        "freq_per_million": None,
        "cefr_error": None,
    }

    try:
        analyzer = get_analyzer()
        # Thử cả dạng gốc và lowercase (database có thể chỉ có chữ thường)
        for lookup in (word, word.lower()):
            level_float = analyzer.get_average_word_level_float(lookup)
            level_cefr = analyzer.get_average_word_level_CEFR(lookup)
            if level_float is not None or level_cefr is not None:
                break
        else:
            # Fallback: lấy theo từng POS rồi lấy trung bình (doc: get_pos_level_dict_for_word)
            pos_levels = analyzer.get_pos_level_dict_for_word(
                word, pos_tag_as_string=True, word_level_as_float=True
            )
            if not pos_levels:
                pos_levels = analyzer.get_pos_level_dict_for_word(
                    word.lower(), pos_tag_as_string=True, word_level_as_float=True
                )
            if pos_levels:
                levels = list(pos_levels.values())
                level_float = sum(levels) / len(levels)
                level_cefr = None  # sẽ suy từ float bên dưới
            else:
                level_float = None
                level_cefr = None

        cefr_str = (
            (level_cefr.name if hasattr(level_cefr, "name") else str(level_cefr))
            if level_cefr is not None
            else None
        )
        result["cefr_level"] = cefr_str
        result["cefr_level_meaning"] = (
            CEFR_LEVEL_MEANINGS.get(cefr_str) if cefr_str else None
        )

        if level_float is not None:
            result["cefr_level_float"] = round(level_float, 2)
            if cefr_str is None:
                # Suy CEFR từ float: 1=A1 .. 6=C2 (doc: CEFRLevel(round(level)))
                level_int = max(1, min(6, round(level_float)))
                result["cefr_level"] = list(CEFR_LEVEL_MEANINGS.keys())[level_int - 1]
                result["cefr_level_meaning"] = CEFR_LEVEL_MEANINGS.get(result["cefr_level"])
        elif cefr_str and cefr_str in CEFR_LEVEL_MEANINGS:
            result["cefr_level_float"] = list(CEFR_LEVEL_MEANINGS.keys()).index(cefr_str) + 1.0
        else:
            result["cefr_level_float"] = None
    except Exception as e:
        result["cefr_error"] = str(e)

    freq_info = get_frequency(word)
    result["frequency"] = freq_info["freq_count"] if freq_info else None
    result["freq_per_million"] = freq_info["freq_per_million"] if freq_info else None

    return jsonify(result)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
