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

def enrich_file_with_reverse_geocoding(input_path="free_to_x.json.original.json", output_path="free_to_x_reverse.json"):
    with open(input_path, 'r', encoding='utf-8') as file:
        raw_data = json.load(file)
        lista_aree = raw_data.get("listaAree", [])
    
    total = len(lista_aree)
    for idx, area in enumerate(lista_aree):
        lat = area.get("lat")
        lon = area.get("lon")
        if lat is not None and lon is not None:
            area["stradaReverse"] = reverse_geocode(lat, lon)
        area["direzione_geografica"] = carreggiata_logica(area.get("strada", ""), area.get("nome", ""))
        percent = int((idx + 1) / total * 100)
        print(f"Reverse geocoding: {percent}% completato ({idx + 1}/{total})", end="\r")

    with open(output_path, 'w', encoding='utf-8') as file:
        output_data = {"listaAree": lista_aree}
        if "data_download" in raw_data:
            output_data["data_download"] = raw_data["data_download"]
        json.dump(output_data, file, ensure_ascii=False, indent=2)
    print(f"\nFile aggiornato salvato in: {output_path}")

def get_autostrada_direzionale(nome_strada):
    direzioni_autostrade = {
        "A1": "NORD-SUD",    # Milano - Napoli
        "A2": "NORD-SUD",    # Salerno - Reggio Calabria
        "A3": "NORD-SUD",    # Napoli - Salerno
        "A4": "EST-OVEST",   # Torino - Trieste
        "A5": "NORD-SUD",    # Torino - Monte Bianco
        "A6": "NORD-SUD",    # Torino - Savona
        "A7": "NORD-SUD",    # Milano - Genova
        "A8": "NORDOVEST-SUDEST",  # Varese - Milano
        "A9": "NORDOVEST-SUDEST",  # Lainate - Chiasso
        "A10": "EST-OVEST",  # Genova - Ventimiglia
        "A11": "EST-OVEST",  # Firenze - Pisa
        "A12": "NORDOVEST-SUDEST", # Genova - Roma
        "A13": "NORD-SUD",   # Bologna - Padova
        "A14": "NORD-SUD",   # Bologna - Taranto
        "A15": "NORD-SUD",   # Parma - La Spezia
        "A16": "EST-OVEST",  # Napoli - Canosa
        "A17": "EST-OVEST",  # Bari - Napoli (storica)
        "A18": "NORD-SUD",   # Messina - Catania
        "A19": "NORD-SUD",   # Palermo - Catania
        "A20": "EST-OVEST",  # Messina - Palermo
        "A21": "EST-OVEST",  # Torino - Brescia
        "A22": "NORD-SUD",   # Modena - Brennero
        "A23": "NORD-SUD",   # Palmanova - Tarvisio
        "A24": "EST-OVEST",  # Roma - Teramo
        "A25": "EST-OVEST",  # Torano - Pescara
        "A26": "NORD-SUD",   # Genova Voltri - Gravellona Toce
        "A27": "NORD-SUD",   # Mestre - Belluno
        "A28": "EST-OVEST",  # Portogruaro - Conegliano
        "A29": "EST-OVEST"   # Palermo - Mazara del Vallo
    }
    for codice, direzione in direzioni_autostrade.items():
        if codice in nome_strada:
            return direzione
    return "NON DEFINITO"

def carreggiata_logica(nome_strada, nome_area):
    asse = get_autostrada_direzionale(nome_strada)
    nome = nome_area.strip().upper()
    if asse == "NORD-SUD":
        return "SUD" if "OVEST" in nome or "SUD" in nome else "NORD"
    elif asse == "EST-OVEST":
        return "EST" if "NORD" in nome or "EST" in nome else "OVEST"
    elif asse == "NORDOVEST-SUDEST":
        return "SUDEST" if "SUD" in nome or "OVEST" in nome else "NORDOVEST"
    elif asse == "NORDEST-SUDOVEST":
        return "SUDOVEST" if "SUD" in nome or "EST" in nome else "NORDEST"
    return "ND"

if __name__ == "__main__":
    enrich_file_with_reverse_geocoding()
