import json
import time
import requests

geocode_cache = {}

def reverse_geocode(lat, lon):
    rounded_lat = round(lat, 4)
    rounded_lon = round(lon, 4)
    if (rounded_lat, rounded_lon) in geocode_cache:
        return geocode_cache[(rounded_lat, rounded_lon)]
    headers = {"User-Agent": "ColonnineJS/1.0 (daniele@example.com)"}  # metti il tuo nome o email reale}
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json"
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()
    street_name = data.get("display_name", "")
    geocode_cache[(rounded_lat, rounded_lon)] = street_name
    time.sleep(1)
    return street_name

def enrich_file_with_reverse_geocoding(input_path="tools/free_to_x.json.original.json", output_path="free_to_x_reverse.json"):
    with open(input_path, 'r', encoding='utf-8') as file:
        raw_data = json.load(file)
        lista_aree = raw_data.get("listaAree", [])
    
    total = len(lista_aree)
    for idx, area in enumerate(lista_aree):
        lat = area.get("lat")
        lon = area.get("lon")
        if lat is not None and lon is not None:
            area["stradaReverse"] = reverse_geocode(lat, lon)
        percent = int((idx + 1) / total * 100)
        print(f"Reverse geocoding: {percent}% completato ({idx + 1}/{total})", end="\r")

    with open(output_path, 'w', encoding='utf-8') as file:
        json.dump({"listaAree": lista_aree}, file, ensure_ascii=False, indent=2)
    print(f"\nFile aggiornato salvato in: {output_path}")

if __name__ == "__main__":
    enrich_file_with_reverse_geocoding()
