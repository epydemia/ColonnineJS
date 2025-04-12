import requests

def download_colonnine_json(url, output_path):
    try:
        print(f"Scaricamento del file JSON da {url}...")
        response = requests.get(url)
        response.raise_for_status()  # Solleva un'eccezione per errori HTTP
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(response.text)
        print(f"File JSON salvato con successo in: {output_path}")
    except requests.exceptions.RequestException as e:
        print(f"Errore durante il download: {e}")

if __name__ == "__main__":
    # URL del file JSON
    url = "https://viabilita.autostrade.it/json/colonnine.json?1742906702332"
    # Percorso di output
    output_path = "free_to_x.json"  # Salva nella directory "data" del progetto
    download_colonnine_json(url, output_path)