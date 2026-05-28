import json

districts = ["Dakshina Kannada","Udupi","Kasaragod"]

for district in districts:
    with open(f"{district.lower().replace(" ","_")}.geojson", "r+", encoding="utf-8") as geojson:
        data = json.load(geojson)
        for feature in data["features"]:
            feature["properties"] = {
                "STATE": "Karnataka",
                "DISTRICT": district,
                "TALUK": "",
                "VILLAGE": feature["properties"]["Village_Name"]
            }
        
        geojson.seek(0)
        json.dump(data, geojson, indent=2, ensure_ascii=False)
        geojson.truncate()
