"""
Builds models/model_metrics.json from things that ALREADY exist:
  * the printed outputs saved inside your notebook (scores + confusion matrices)
  * the saved model files (feature importances / coefficients)

Nothing is retrained and no number is made up.

Run from the backend folder:
    python build_metrics.py path/to/Insurance_Fraud_Detection.ipynb
"""
import json
import re
import sys

import joblib

NAMES = ["Logistic Regression", "KNN", "Random Forest", "SVM"]
FILES = {"Logistic Regression": "logistic_regression", "KNN": "knn",
         "Random Forest": "random_forest", "SVM": "svm"}

notebook = json.load(open(sys.argv[1], encoding="utf-8"))


def outputs_text(cell):
    text = ""
    for out in cell.get("outputs", []):
        text += "".join(out.get("text", [])) + "".join(out.get("data", {}).get("text/plain", []))
    return text


def find_cell(snippet):
    for cell in notebook["cells"]:
        if cell["cell_type"] == "code" and snippet in "".join(cell["source"]):
            return cell
    raise SystemExit("Could not find notebook cell containing: " + snippet)


# 1) Confusion matrices (Step 12 printout)
cm_text = outputs_text(find_cell("Print TN, FP, FN, TP"))
matrices = {}
for name in NAMES:
    m = re.search(re.escape(name) + r"\s*-> TN: (\d+) FP: (\d+) FN: (\d+) TP: (\d+)", cm_text)
    tn, fp, fn, tp = map(int, m.groups())
    matrices[name] = {"tn": tn, "fp": fp, "fn": fn, "tp": tp}

# 2) Score table (Step 13 printout) - used to double check our own maths
table_text = outputs_text(find_cell("comparison = pd.DataFrame"))
reported = {}
for name in NAMES:
    m = re.search(re.escape(name) + r"\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)", table_text)
    acc, prec, rec, f1, auc = map(float, m.groups())
    reported[name] = {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "roc_auc": auc}

# 3) Compute metrics from the confusion matrix and verify against the notebook table
models = []
for name in NAMES:
    c = matrices[name]
    total = c["tn"] + c["fp"] + c["fn"] + c["tp"]
    acc = (c["tn"] + c["tp"]) / total
    prec = c["tp"] / (c["tp"] + c["fp"])
    rec = c["tp"] / (c["tp"] + c["fn"])
    f1 = 2 * prec * rec / (prec + rec)
    for key, value in [("accuracy", acc), ("precision", prec), ("recall", rec), ("f1", f1)]:
        assert abs(round(value, 4) - reported[name][key]) < 1e-9, (name, key, value, reported[name][key])
    models.append({
        "name": name,
        "accuracy": acc, "precision": prec, "recall": rec, "f1": f1,
        "roc_auc": reported[name]["roc_auc"],      # AUC needs probabilities: copied from the notebook table (4 decimals)
        "confusion_matrix": c,
    })
print("Metrics computed from confusion matrices match the notebook table.")

# 4) Feature importance from the saved model files
columns = joblib.load("models/model_columns.pkl")
rf = joblib.load("models/random_forest.pkl")
lr = joblib.load("models/logistic_regression.pkl")
rf_top = sorted(zip(columns, rf.feature_importances_), key=lambda x: -x[1])[:10]
lr_top = sorted(zip(columns, lr.coef_[0]), key=lambda x: -abs(x[1]))[:10]

# check against the Random Forest top-10 printed in the notebook
rf_text = outputs_text(find_cell("Which features were most important"))
for feature, value in rf_top:
    m = re.search(re.escape(feature) + r"\s+([\d.]+)", rf_text)
    assert m and abs(float(m.group(1)) - value) < 1e-5, ("importance mismatch", feature)
print("Random Forest importances in the .pkl match the notebook output.")

result = {
    "test_set": {
        "rows": sum(matrices["KNN"].values()),
        "genuine": matrices["KNN"]["tn"] + matrices["KNN"]["fp"],
        "fraud": matrices["KNN"]["fn"] + matrices["KNN"]["tp"],
    },
    # numbers printed in the notebook (Step 3 and Step 7)
    "fraud_distribution": [
        {"label": "Full dataset", "genuine": 14497, "fraud": 923},
        {"label": "Test set", "genuine": 2899, "fraud": 185},
        {"label": "Train before SMOTE", "genuine": 11597, "fraud": 738},
        {"label": "Train after SMOTE", "genuine": 11597, "fraud": 11597},
    ],
    "models": models,
    "feature_importance": {
        "random_forest": [{"feature": f, "value": float(v)} for f, v in rf_top],
        "logistic_regression": [{"feature": f, "value": float(v)} for f, v in lr_top],
    },
    # filled in only if you run export_roc.py on your real test set
    "roc_curves": None,
    "notes": [
        "All four models were trained on SMOTE-balanced training data and evaluated on the same untouched, imbalanced test set.",
        "Scores use the default 0.5 decision threshold.",
    ],
}
assert result["test_set"]["genuine"] == 2899 and result["test_set"]["fraud"] == 185
json.dump(result, open("models/model_metrics.json", "w"), indent=2)
print("Wrote models/model_metrics.json")
