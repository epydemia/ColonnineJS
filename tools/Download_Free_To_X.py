import requests
import json

def download_colonnine_json(url, output_path):
    try:
        print(f"Scaricamento del file JSON da {url}...")
        response = requests.get(url, timeout=10)  # timeout in secondi
        response.raise_for_status()  # Solleva un'eccezione per errori HTTP
        colonnine_data = response.json()

        original_output_path = output_path + ".original.json"
        with open(original_output_path, 'w', encoding='utf-8') as original_file:
            json.dump(colonnine_data, original_file, ensure_ascii=False, indent=2)
        
        print(f"File JSON salvato con successo in: {original_output_path}")
    except requests.exceptions.RequestException as e:
        print(f"Errore durante il download: {e}")

if __name__ == "__main__":
    # URL del file JSON
    url = "https://viabilita.autostrade.it/json/colonnine.json?1744621070233"

    # Percorso di output
    output_path = "free_to_x.json"  # Salva nella directory "data" del progetto
    download_colonnine_json(url, output_path)