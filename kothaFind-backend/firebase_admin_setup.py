import os
import json
import firebase_admin
from firebase_admin import credentials

if not firebase_admin._apps:
    if os.getenv("FIREBASE_CREDENTIALS"):
        # Railway: load credentials from environment variable
        cred_dict = json.loads(os.getenv("FIREBASE_CREDENTIALS"))
        cred = credentials.Certificate(cred_dict)
    else:
        # Local development: load credentials from JSON file
        cred = credentials.Certificate("serviceAccountKey.json")

    firebase_admin.initialize_app(cred)