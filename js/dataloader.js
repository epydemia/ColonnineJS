let cachedAree = null;

export async function getAree() {

  if (cachedAree) return cachedAree;

  let dataFreeToX = { listaAree: [] };
  let dataTest = { listaAree: [] };

  try {
    console.log("Caricamento del file free_to_x_reverse.json...");
    const resFreeToX = await fetch('./data/free_to_x_reverse.json');
    if (!resFreeToX.ok) throw new Error("Errore nel caricamento del file free_to_x_reverse.json");
    dataFreeToX = await resFreeToX.json();
    console.log("File free_to_x_reverse.json caricato con successo.");
  } catch (err) {
    console.error("❌ Errore nel caricamento del file free_to_x_reverse.json:", err);
  }

  try {
    console.log("Caricamento del file test.json...");
    const resTest = await fetch('./data/test.json');
    if (!resTest.ok) throw new Error("Errore nel caricamento del file test.json");
    dataTest = await resTest.json();
    console.log("File test.json caricato con successo.");
  } catch (err) {
    console.error("❌ Errore nel caricamento del file test.json:", err);
  }

  cachedAree = [
    ...(dataFreeToX.listaAree || []),
    ...(dataTest.listaAree || [])
  ];

  return cachedAree;
}
