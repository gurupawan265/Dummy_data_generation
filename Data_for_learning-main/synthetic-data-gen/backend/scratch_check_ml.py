try:
    import sklearn
    import xgboost
    print("Success: sklearn and xgboost are installed.")
except ImportError as e:
    print(f"Error: {e}")
