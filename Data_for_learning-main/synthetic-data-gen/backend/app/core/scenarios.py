from typing import List, Dict, Any

LEARNING_SCENARIOS = [
    {
        "id": "class-imbalance",
        "title": "The Fraud Detection Paradox",
        "subtitle": "Class Imbalance Problem",
        "description": "Discover why 99.9% accuracy can be a failure. Learn to handle datasets where the 'interesting' event is extremely rare.",
        "difficulty": "Beginner",
        "category": "ML Fundamentals",
        "schema": {
            "tables": [
                {
                    "id": "fraud-table",
                    "name": "FinancialTransactions",
                    "fields": [
                        {"id": "f1", "name": "id", "type": "uuid", "config": {}},
                        {"id": "f2", "name": "amount", "type": "float", "config": {"min": 1, "max": 10000}},
                        {"id": "f3", "name": "merchant_category", "type": "category", "config": {"categories": ["Retail", "Food", "Travel", "Electronics", "Gas"]}},
                        {"id": "f4", "name": "is_fraud", "type": "integer", "config": {"min": 0, "max": 1, "noise": 0.01}}
                    ]
                }
            ],
            "relationships": []
        },
        "theory": {
            "analogy": "Imagine a security guard at a stadium. If 99,999 people are fans and 1 is a rowdy intruder, a guard who sleeps all day is 'correct' 99.99% of the time, but they failed to catch the intruder.",
            "challenge": "Models naturally want to minimize error. In imbalanced data, the easiest way to minimize error is to ignore the minority class entirely.",
            "metrics_to_watch": ["Recall", "Precision", "F1-Score"]
        },
        "experiments": [
            {
                "task": "High Imbalance",
                "description": "Generate 1000 rows with very low fraud rate and check if Accuracy is high but Recall is 0."
            },
            {
                "task": "Balanced Approach",
                "description": "Modify the generator to create more 'is_fraud=1' cases and see metrics stabilize."
            }
        ]
    },
    {
        "id": "overfitting-noise",
        "title": "The Signal vs. Noise",
        "subtitle": "Overfitting & Noisy Labels",
        "description": "Learn what happens when a model memorizes noise instead of learning patterns. See the gap between training and test performance.",
        "difficulty": "Intermediate",
        "category": "Model Quality",
        "schema": {
            "tables": [
                {
                    "id": "noise-table",
                    "name": "CustomerChurn",
                    "fields": [
                        {"id": "n1", "name": "customer_id", "type": "uuid", "config": {}},
                        {"id": "n2", "name": "usage_minutes", "type": "integer", "config": {"min": 10, "max": 2000}},
                        {"id": "n3", "name": "random_noise_id", "type": "uuid", "config": {}},
                        {"id": "n4", "name": "churned", "type": "integer", "config": {"min": 0, "max": 1, "noise": 0.4}}
                    ]
                }
            ],
            "relationships": []
        },
        "theory": {
            "analogy": "A student who memorizes every specific answer in a practice exam but doesn't understand the formulas will fail the real exam when the numbers change.",
            "challenge": "When data has high noise, complex models like Decision Trees try to fit every outlier, leading to poor generalization.",
            "metrics_to_watch": ["Train-Test Gap", "R2 Score"]
        },
        "experiments": [
            {
                "task": "Identify Overfitting",
                "description": "Increase noise to 0.5 and observe how the Decision Tree gets perfect training score but terrible test score."
            }
        ]
    },
    {
        "id": "production-fraud",
        "title": "Credit Card Fraud Emulation",
        "subtitle": "Kaggle-Style Messy Data",
        "description": "A high-fidelity simulation of credit card transactions featuring heavy class imbalance, temporal dependencies, and behavioral correlations.",
        "difficulty": "Advanced",
        "category": "System Emulation",
        "schema": {
            "tables": [
                {
                    "id": "trans-table",
                    "name": "Transactions",
                    "fields": [
                        {"id": "t1", "name": "timestamp", "type": "datetime", "config": {}},
                        {"id": "t2", "name": "amount", "type": "float", "config": {"min": 0.5, "max": 5000}},
                        {"id": "t3", "name": "card_type", "type": "category", "config": {"categories": ["Visa", "Mastercard", "Amex"]}},
                        {"id": "t4", "name": "dist_from_home", "type": "float", "config": {"min": 0.1, "max": 2000}},
                        {"id": "t5", "name": "is_fraud", "type": "integer", "config": {"min": 0, "max": 1, "missing_data": {"type": "random", "percentage": 0.05}}}
                    ],
                    "constraints": [
                        {"rule": "amount < 10000", "type": "numeric"}
                    ],
                    "correlations": [
                        {"feature_1": "dist_from_home", "feature_2": "is_fraud", "type": "positive", "strength": "strong"}
                    ]
                }
            ],
            "relationships": []
        },
        "theory": {
            "analogy": "Real fraud detection isn't just about large amounts; it's about deviations from patterns (e.g., a card used 1000 miles away from home).",
            "challenge": "Features are often hidden. You must derive 'velocity' or 'distance' to find the signal.",
            "metrics_to_watch": ["AUPRC", "Confusion Matrix"]
        }
    },
    {
        "id": "iot-anomalies",
        "title": "Industrial IoT Sensor Web",
        "subtitle": "Time-Series & Anomaly Detection",
        "description": "Simulate a network of industrial sensors. Detect subtle equipment failures hidden in high-frequency numeric streams.",
        "difficulty": "Intermediate",
        "category": "System Emulation",
        "schema": {
            "tables": [
                {
                    "id": "sensor-table",
                    "name": "SensorLogs",
                    "fields": [
                        {"id": "s1", "name": "machine_id", "type": "uuid", "config": {}},
                        {"id": "s2", "name": "temperature", "type": "float", "config": {"min": 20, "max": 120}},
                        {"id": "s3", "name": "vibration", "type": "float", "config": {"min": 0, "max": 10}},
                        {"id": "s4", "name": "pressure", "type": "float", "config": {"min": 90, "max": 150}},
                        {"id": "s5", "name": "status", "type": "category", "config": {"categories": ["Operational", "Maintenance", "Failure"]}}
                    ],
                    "correlations": [
                        {"feature_1": "temperature", "feature_2": "pressure", "type": "positive", "strength": "strong"}
                    ]
                }
            ]
        },
        "theory": {
            "analogy": "Like a doctor listening to a heartbeat, industrial sensors pick up the 'rhythm' of a machine. A skip in that rhythm is a failure.",
            "challenge": "Temporal correlation. A single high temperature reading might be fine, but a steady climb over 10 minutes is a fire risk.",
            "metrics_to_watch": ["Time-to-Failure", "Anomalous Points"]
        }
    },
    {
        "id": "recsys-sparse",
        "title": "E-Commerce Recommendation Engine",
        "subtitle": "Sparse Matrices & Cold Start",
        "description": "Simulate user-item interaction logs. Handle the 'sparsity problem' where most users only interact with a tiny fraction of items.",
        "difficulty": "Intermediate",
        "category": "System Emulation",
        "schema": {
            "tables": [
                {
                    "id": "interactions",
                    "name": "UserInteractions",
                    "fields": [
                        {"id": "ri1", "name": "user_id", "type": "uuid", "config": {}},
                        {"id": "ri2", "name": "product_id", "type": "integer", "config": {"min": 100, "max": 5000}},
                        {"id": "ri3", "name": "rating", "type": "integer", "config": {"min": 1, "max": 5}},
                        {"id": "ri4", "name": "on_sale", "type": "integer", "config": {"min": 0, "max": 1}}
                    ],
                    "correlations": [
                        {"feature_1": "on_sale", "feature_2": "rating", "type": "positive", "strength": "moderate"}
                    ]
                }
            ]
        },
        "theory": {
            "analogy": "A library with 1 million books. Most people only ever borrow 10. The 'matrix' of who read what is 99% empty.",
            "challenge": "Collaborative filtering fails when data is too sparse. You need content-based signals (like 'on_sale') to bridge the gap.",
            "metrics_to_watch": ["Sparsity %", "Precision@K"]
        }
    },
    {
        "id": "nlp-sentiment",
        "title": "The Sentiment Analysis Trap",
        "subtitle": "NLP & Semantic Nuance",
        "description": "Text is more than words. Learn how domain (Legal vs. Social) and Tone (Sarcastic vs. Formal) shift model accuracy.",
        "difficulty": "Intermediate",
        "category": "NLP Lab",
        "schema": {
            "tables": [
                {
                    "id": "nlp-table",
                    "name": "SocialMediaReviews",
                    "fields": [
                        {"id": "text1", "name": "comment", "type": "nlp_text", "config": {"task": "review", "domain": "tech", "tone": "casual"}},
                        {"id": "label1", "name": "sentiment", "type": "category", "config": {"categories": ["Positive", "Negative", "Neutral"]}}
                    ],
                    "correlations": [
                        {"feature_1": "sentiment", "feature_2": "comment", "type": "positive", "strength": "strong"}
                    ]
                }
            ]
        },
        "theory": {
            "analogy": "The same word 'Cold' is negative in a soup review but positive in a beer review. Context is king.",
            "challenge": "Models often over-fit to specific keywords (e.g., 'not') without understanding the holistic semantic structure.",
            "metrics_to_watch": ["Precision", "F1-Score", "Stopword Impact"]
        }
    },
    {
        "id": "credit-scoring",
        "title": "The Credit Risk Matrix",
        "subtitle": "Credit Scoring & Default Prediction",
        "description": "Predict the probability of default based on financial history, income, and demographic data. Handle complex monotonic constraints.",
        "difficulty": "Advanced",
        "category": "Finance",
        "schema": {
            "tables": [
                {
                    "id": "credit-table",
                    "name": "CreditApplications",
                    "fields": [
                        {"id": "cs1", "name": "annual_income", "type": "currency", "config": {"min": 20000, "max": 200000}},
                        {"id": "cs2", "name": "credit_utilization", "type": "percentage", "config": {"min": 0, "max": 100}},
                        {"id": "cs3", "name": "prior_defaults", "type": "integer", "config": {"min": 0, "max": 5}},
                        {"id": "cs4", "name": "loan_amount", "type": "currency", "config": {"min": 1000, "max": 50000}},
                        {"id": "cs5", "name": "status", "type": "category", "config": {"categories": ["Approved", "Denied"]}}
                    ],
                    "correlations": [
                        {"feature_1": "annual_income", "feature_2": "status", "type": "positive", "strength": "moderate"},
                        {"feature_1": "prior_defaults", "feature_2": "status", "type": "negative", "strength": "strong"}
                    ],
                    "constraints": [
                        {"rule": "loan_amount < annual_income * 0.5", "type": "numeric"}
                    ]
                }
            ]
        },
        "theory": {
            "analogy": "Lending money is like a bet on someone's future behavior based on their past track record.",
            "challenge": "Fairness and Bias. You must ensure the model doesn't use proxy features for protected attributes.",
            "metrics_to_watch": ["Gini Coefficient", "ROC-AUC"]
        }
    },
    {
        "id": "medical-diagnosis",
        "title": "Clinical Decision Support",
        "subtitle": "Medical Diagnosis & Precision",
        "description": "Diagnose rare conditions from a battery of clinical tests. Here, a False Negative is much costlier than a False Positive.",
        "difficulty": "Advanced",
        "category": "Healthcare",
        "schema": {
            "tables": [
                {
                    "id": "med-table",
                    "name": "ClinicalTests",
                    "fields": [
                        {"id": "m1", "name": "age", "type": "integer", "config": {"min": 1, "max": 100}},
                        {"id": "m2", "name": "blood_pressure_sys", "type": "integer", "config": {"min": 90, "max": 180}},
                        {"id": "m3", "name": "cholesterol", "type": "integer", "config": {"min": 150, "max": 300}},
                        {"id": "m4", "name": "glucose", "type": "integer", "config": {"min": 70, "max": 200}},
                        {"id": "m5", "name": "diagnosis", "type": "category", "config": {"categories": ["Healthy", "Condition_A", "Condition_B"]}}
                    ],
                    "correlations": [
                        {"feature_1": "age", "feature_2": "diagnosis", "type": "positive", "strength": "moderate"},
                        {"feature_1": "glucose", "feature_2": "diagnosis", "type": "positive", "strength": "strong"}
                    ]
                }
            ]
        },
        "theory": {
            "analogy": "Finding a needle in a haystack where missing the needle could be fatal.",
            "challenge": "High stakes. High precision is required, but high recall is mandatory.",
            "metrics_to_watch": ["Sensitivity (Recall)", "Specificity", "F2-Score"]
        }
    }
]

def get_scenarios() -> List[Dict[str, Any]]:
    return LEARNING_SCENARIOS
