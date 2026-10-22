"""
OPTIONAL: adds real ROC curves to models/model_metrics.json.

ROC curves need the test-set probabilities, which only exist in your Colab notebook
(the dataset is not in this project). Paste the code below as a NEW CELL at the very
end of the notebook (after Step 13), run it, download model_roc.json, and put it in
backend/models/ . Then run:   python export_roc.py
and refresh the Model Visualizations page.

----- paste this into a Colab cell -----
import json
from sklearn.metrics import roc_curve
probs = {"Logistic Regression": y_prob_lr, "KNN": y_prob_knn,
         "Random Forest": y_prob_rf, "SVM": y_prob_svm}
out = {}
for name, p in probs.items():
    fpr, tpr, _ = roc_curve(y_test, p)
    step = max(1, len(fpr) // 150)           # keep the file small
    idx = list(range(0, len(fpr), step)) + [len(fpr) - 1]
    out[name] = [{"fpr": float(fpr[i]), "tpr": float(tpr[i])} for i in idx]
json.dump(out, open("model_roc.json", "w"))
from google.colab import files; files.download("model_roc.json")
----------------------------------------
"""
import json

metrics = json.load(open("models/model_metrics.json", encoding="utf-8"))
metrics["roc_curves"] = json.load(open("models/model_roc.json", encoding="utf-8"))
json.dump(metrics, open("models/model_metrics.json", "w"), indent=2)
print("ROC curves added to models/model_metrics.json")
